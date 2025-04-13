import express, { Request, Response } from 'express';
import {GoogleGenAI} from '@google/genai';
import { ForeignPrice, Link, Price } from './types/interfaces';
import dotenv from 'dotenv';
import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const supabaseURL = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
if (supabaseURL == undefined) {
    throw Error("Supabase URL undefined!");
}
if (supabaseKey == undefined) {
    throw Error("Supabase Key undefined!");
}
const supabase = createClient(supabaseURL, supabaseKey);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});
const cors = require('cors');

const app = express();
app.use(cors());
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Define a simple GET route
app.get('/api/screenshot', async (req: Request, res: Response) => {
    // extract link
    const link: string = req.query.link as string;
    console.log("-= RECEIVED GET SCREENSHOT REQUEST =-")
    console.log("link: " + link);

    // Get a list of other country links
    const alternateLinks: Link[] = await generateAlternateLinks(link);

    let price: Price = await fetchLowestPriceUSD(alternateLinks);

    console.log("SENDING GET RESPONSE");
    res.send(JSON.stringify({"item_id": await uploadPrice(price)}));
    console.log("GET RESPONSE SENT\n\n")
});

// Define a POST route that echoes back the JSON sent in the request body
app.post('/data', (req: Request, res: Response) => {
    const requestData = req.body;
    res.json({
        success: true,
        data: requestData
    });
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

async function generateAlternateLinks(link: string): Promise<Link[]> {
    const prompt = 
`The following is a link for a US website showing a specific product:` + link +
`
Create a JSON array containing exactly 11 elements. Each element should have an item name including brand in english of the specific product, which is the same across all elements. The first element should be the provided US link. Then include 10 links to the exact same product on different country versions of this website, each paired with the country's ISO 3166-1 alpha-2 code. 

The output must exactly follow this JSON format:

[
  {
    "item_name": "string",
    "link": "string",
    "country_code": "string"
  }
]

Do not include markdown formatting, additional explanations, or comments. Your output should be directly parsable by a JSON parser.
`;

    console.log('Sending Gemini API request to generate alternate links.');
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: prompt,
    });
    const responseTextRaw = response.text;
    if (responseTextRaw == undefined) {
        throw new Error('Gemini API call returned undefined response.');
    }

    const responseText = responseTextRaw.slice(8, -4);
    const jsonData = JSON.parse(responseText) as Link[];
    console.log('Successfully received alternate links.');
    return jsonData;
}

async function fetchLowestPriceUSD(links: Link[]): Promise<Price> {
    console.log("Finding the lowest price.");

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const hash: string = hashURL(links[0].link);

    const pricePromises = links.map(async (link) => {
        try {
            const price = await fetchPriceUSD(link.link, link.country_code, hash, await browser.newPage());
            return {
                item_name: link.item_name,
                country_code: link.country_code,
                price_domestic: null,
                price_foreign: price,
                image_link: null,
                website_link: link.link,
            };
        } catch (error) {
            console.error(`Error fetching price for ${link.country_code}:`, error);
            return {
                item_name: null,
                country_code: link.country_code,
                price_domestic: null,
                price_foreign: Number.MAX_VALUE, // Use high number so it doesn't get picked
                image_link:null,
                website_link: link.link,
            };
        }
    });

    const results = await Promise.all(pricePromises);
    await browser.close();

    // Find the lowest price among successful results
    const lowest: Price = { 
      item_name: links[0].item_name, 
      country_code: "US", 
      price_domestic: results[0].price_foreign,
      price_foreign: Number.MAX_VALUE,
      image_link: await searchProductImage(links[0].item_name),
      website_link: "https://www.jupiterp.com/"
    };
    results.forEach((current) => {
      if (current.price_foreign != null && current.price_foreign < lowest.price_foreign) {
        lowest.country_code = current.country_code;
        lowest.price_foreign = current.price_foreign;
        lowest.website_link = current.website_link;
      }
    });

    console.log("Lowest price found:", lowest);
    return lowest;
}


function hashURL(url: string): string {
    return createHash('sha256').update(url).digest('hex');
  }

// Helper to encode image
function fileToGenerativePart(filePath: string, mimeType: string) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(filePath)).toString("base64"),
      mimeType,
    },
  };
}

async function fetchPriceUSD(link: string, country: string, hash: string, page: Page): Promise<Number> {
    console.log('Getting price for: ' + country);
    const outputPath = './screenshots/' + hash + '/' + country + '.png';

    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    await page.setRequestInterception(true)
    page.on('request', (request) => {
        if (request.resourceType() === 'image') request.abort()
        else request.continue()
    });

    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
    await page.goto(link, { waitUntil: 'networkidle2' });
    await page.screenshot({
        path: outputPath,
        fullPage: true
    });

    const prompt = 
    `This is a screenshot for a product on a website for the country with the following ISO 3166-1 alpha-2 code: ` + country + `. Extract the price of the product; you should only find a single price, which should be the price of the main product on the page and not any others. 
    If you cannot see a price for a main item on the page, just return null for the price.
    Additionally, return the local currency the price is given in as a ISO 4217 code in all caps.
    Please respond only in JSON format as shown below. Return only a JSON object. Do not include markdown formatting (like triple backticks), comments, or explanations. Your output should be directly parsable by a JSON parser.
    {
    "currency": "string",
    "price": number
    }
    Make sure your output is exactly in this format.
    `;

    const imagePart = fileToGenerativePart(outputPath, 'image/png');

    console.log('Sending Gemini API request to extract price.');
    const response = await ai.models.generateContent({
        model: 'gemini-2.0-flash-001',
        contents: [prompt, imagePart],
    });
    const responseTextRaw = response.text;
    if (responseTextRaw == undefined) {
        throw new Error('Gemini API call returned undefined response.');
    }
    const responseText = responseTextRaw.slice(8, -4);

    try {
      const parsed: ForeignPrice = JSON.parse(responseText);
      console.log("Successfully extracted price:", parsed);
      return await convertToUSD(parsed.currency, parsed.price);
    } catch (err) {
      console.error("Failed to parse Gemini output:", responseText);
      throw new Error("Invalid JSON response from Gemini.");
    }
}

async function convertToUSD(currency: string, price: Number): Promise<Number> {
    try {
        // Fetch exchange rate from a public API.  This API may have limitations.
        const response = await fetch(`https://api.exchangerate-api.com/v4/latest/USD`); //Using USD as base
        if (!response.ok) {
            // Handle HTTP errors (e.g., 404, 500)
            console.error(`Error fetching exchange rate: ${response.status} ${response.statusText}`);
            return NaN; //  Return NaN to indicate failure.  Caller should check for this.
        }
        const data = await response.json();

        // Extract the exchange rate.  The API response structure is assumed here.
        const exchangeRate = data.rates[currency.toUpperCase()];
        if (typeof exchangeRate !== 'number') {
            console.error(`Exchange rate for ${currency} not found in API response.`);
            return NaN;
        }

        // Perform the conversion.
        const priceInUSD = price.valueOf() / exchangeRate;
        return priceInUSD;

    } catch (error) {
        // Handle network errors, JSON parsing errors, and other exceptions.
        console.error('Error during conversion:', error);
        return NaN; // Return NaN to signal an error.
    }
}

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY!;
const CX = process.env.GOOGLE_CX!;

export async function searchProductImage(productName: string): Promise<string> {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    productName
  )}&cx=${CX}&key=${GOOGLE_API_KEY}&searchType=image`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    return data.items[0].link;
  } else {
    return "";
  }
}

export async function uploadPrice(price: Price): Promise<number> {
  // Step 1: Fetch all existing item_ids in ascending order
  const { data, error } = await supabase
    .from('items')
    .select('item_id')
    .order('item_id', { ascending: true });

  if (error) throw new Error(`Failed to fetch item IDs: ${error.message}`);

  const usedIds = data!.map((row) => row.item_id);
  let newId = 1;

  for (const id of usedIds) {
    if (id === newId) newId++;
    else break;
  }

  // Step 2: Insert the new price record
  const { error: insertError } = await supabase.from('items').insert({
    item_id: newId,
    item_name: price.item_name,
    src_country: codeToCountryName[price.country_code],
    link: price.website_link,
    price_us: price.price_domestic,
    price_src: price.price_foreign,
    image_link: price.image_link,
    timestamp: new Date().toISOString(),
  });

  if (insertError) throw new Error(`Failed to insert price: ${insertError.message}`);

  return newId;
}

export const codeToCountryName: Record<string, string> = {
    "af": "Afghanistan",
    "al": "Albania",
    "dz": "Algeria",
    "ad": "Andorra",
    "ao": "Angola",
    "ar": "Argentina",
    "am": "Armenia",
    "au": "Australia",
    "at": "Austria",
    "az": "Azerbaijan",
    "bs": "Bahamas",
    "bh": "Bahrain",
    "bd": "Bangladesh",
    "by": "Belarus",
    "be": "Belgium",
    "bz": "Belize",
    "bj": "Benin",
    "bt": "Bhutan",
    "bo": "Bolivia",
    "ba": "Bosnia and Herzegovina",
    "bw": "Botswana",
    "br": "Brazil",
    "bn": "Brunei",
    "bg": "Bulgaria",
    "bf": "Burkina Faso",
    "bi": "Burundi",
    "kh": "Cambodia",
    "cm": "Cameroon",
    "ca": "Canada",
    "cf": "Central African Republic",
    "td": "Chad",
    "cl": "Chile",
    "cn": "China",
    "co": "Colombia",
    "km": "Comoros",
    "cg": "Congo (Brazzaville)",
    "cd": "Congo (Kinshasa)",
    "cr": "Costa Rica",
    "hr": "Croatia",
    "cu": "Cuba",
    "cy": "Cyprus",
    "cz": "Czech Republic",
    "dk": "Denmark",
    "dj": "Djibouti",
    "dm": "Dominica",
    "do": "Dominican Republic",
    "ec": "Ecuador",
    "eg": "Egypt",
    "sv": "El Salvador",
    "ee": "Estonia",
    "sz": "Eswatini",
    "et": "Ethiopia",
    "fj": "Fiji",
    "fi": "Finland",
    "fr": "France",
    "ga": "Gabon",
    "gm": "Gambia",
    "ge": "Georgia",
    "de": "Germany",
    "gh": "Ghana",
    "gr": "Greece",
    "gt": "Guatemala",
    "gn": "Guinea",
    "ht": "Haiti",
    "hn": "Honduras",
    "hu": "Hungary",
    "is": "Iceland",
    "in": "India",
    "id": "Indonesia",
    "ir": "Iran",
    "iq": "Iraq",
    "ie": "Ireland",
    "il": "Israel",
    "it": "Italy",
    "jm": "Jamaica",
    "jp": "Japan",
    "jo": "Jordan",
    "kz": "Kazakhstan",
    "ke": "Kenya",
    "kw": "Kuwait",
    "kg": "Kyrgyzstan",
    "la": "Laos",
    "lv": "Latvia",
    "lb": "Lebanon",
    "ls": "Lesotho",
    "lr": "Liberia",
    "ly": "Libya",
    "lt": "Lithuania",
    "lu": "Luxembourg",
    "mg": "Madagascar",
    "mw": "Malawi",
    "my": "Malaysia",
    "mv": "Maldives",
    "ml": "Mali",
    "mt": "Malta",
    "mr": "Mauritania",
    "mu": "Mauritius",
    "mx": "Mexico",
    "md": "Moldova",
    "mc": "Monaco",
    "mn": "Mongolia",
    "me": "Montenegro",
    "ma": "Morocco",
    "mz": "Mozambique",
    "mm": "Myanmar",
    "na": "Namibia",
    "np": "Nepal",
    "nl": "Netherlands",
    "nz": "New Zealand",
    "ni": "Nicaragua",
    "ne": "Niger",
    "ng": "Nigeria",
    "kp": "North Korea",
    "mk": "North Macedonia",
    "no": "Norway",
    "om": "Oman",
    "pk": "Pakistan",
    "pa": "Panama",
    "py": "Paraguay",
    "pe": "Peru",
    "ph": "Philippines",
    "pl": "Poland",
    "pt": "Portugal",
    "qa": "Qatar",
    "ro": "Romania",
    "ru": "Russia",
    "rw": "Rwanda",
    "sa": "Saudi Arabia",
    "sn": "Senegal",
    "rs": "Serbia",
    "sg": "Singapore",
    "sk": "Slovakia",
    "si": "Slovenia",
    "so": "Somalia",
    "za": "South Africa",
    "kr": "South Korea",
    "es": "Spain",
    "lk": "Sri Lanka",
    "sd": "Sudan",
    "se": "Sweden",
    "ch": "Switzerland",
    "sy": "Syria",
    "tw": "Taiwan",
    "tj": "Tajikistan",
    "tz": "Tanzania",
    "th": "Thailand",
    "tg": "Togo",
    "tt": "Trinidad and Tobago",
    "tn": "Tunisia",
    "tr": "Turkey",
    "tm": "Turkmenistan",
    "ug": "Uganda",
    "ua": "Ukraine",
    "ae": "United Arab Emirates",
    "gb": "United Kingdom",
    "us": "United States",
    "uy": "Uruguay",
    "uz": "Uzbekistan",
    "ve": "Venezuela",
    "vn": "Vietnam",
    "ye": "Yemen",
    "zm": "Zambia",
    "zw": "Zimbabwe"
};