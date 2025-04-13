import express, { Request, Response } from 'express';
import {GoogleGenAI} from '@google/genai';
import { ForeignPrice, Link, Price } from './types/interfaces';
import dotenv from 'dotenv';
import puppeteer, { Page } from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';

dotenv.config();

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const ai = new GoogleGenAI({apiKey: GEMINI_API_KEY});

const app = express();
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
    res.send(JSON.stringify(price));
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
Create a JSON array containing exactly 11 elements. The first element should be the provided US link. Then include 10 links to the exact same product on different country versions of this website, each paired with the country's ISO 3166-1 alpha-3 code. 

The output must exactly follow this JSON format:

[
  {
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
                country_code: link.country_code,
                priceUSD: price
            };
        } catch (error) {
            console.error(`Error fetching price for ${link.country_code}:`, error);
            return {
                country_code: link.country_code,
                priceUSD: Number.MAX_VALUE // Use high number so it doesn't get picked
            };
        }
    });

    const results = await Promise.all(pricePromises);
    await browser.close();

    // Find the lowest price among successful results
    const lowest: Price = { country_code: "USA", priceUSD: Number.MAX_VALUE };
    results.forEach((current) => {
      if (current.priceUSD != null && current.priceUSD < lowest.priceUSD) {
        lowest.country_code = current.country_code;
        lowest.priceUSD = current.priceUSD;
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
    await page.goto(link, { waitUntil: 'domcontentloaded' });
    await page.screenshot({
        path: outputPath,
        fullPage: true
    });

    const prompt = 
    `This is a screenshot for a product on a website for the country with the following ISO 3166-1 alpha-3 code: ` + country + `. Extract the price of the product; you should only find a single price, which should be the price of the main product on the page and not any others. 
    If you cannot confidently see a price for a main item on the page, just return null for the price.
    Additionally, return the local currency the price is given in as a ISO 4217 code.
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