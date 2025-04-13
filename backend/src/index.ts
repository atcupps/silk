import express, { Request, Response } from 'express';
import {GoogleGenAI} from '@google/genai';
import { Link, Price } from './types/interfaces';
import dotenv from 'dotenv';
import puppeteer, { Browser, Page } from 'puppeteer';
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

    const browser = await puppeteer.launch();

    const hash: string = hashURL(links[0].link);

    // Start all fetchPriceUSD calls concurrently
    const pricePromises = links.map(async (link) => {
        const price = await fetchPriceUSD(link.link, link.country_code, hash, await browser.newPage());
        return {
            country_code: link.country_code,
            priceUSD: price
        };
    });

    // Wait for all promises to resolve
    const results = await Promise.all(pricePromises);

    await browser.close();

    // Find the entry with the lowest price
    const lowest = results.reduce((min, current) => {
        return current.priceUSD < min.priceUSD ? current : min;
    }, { country_code: "USA", priceUSD: Number.MAX_VALUE });

    console.log("Lowest price found:", lowest);
    return lowest;
}


function hashURL(url: string): string {
    return createHash('sha256').update(url).digest('hex');
  }

async function fetchPriceUSD(link: string, country: string, hash: string, page: Page): Promise<Number> {
    const outputPath = './screenshots/' + hash + '/' + country + '.png';

    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }

    await page.setViewport({
        width: 1920,
        height: 1080
    });
    await page.goto(link, { waitUntil: 'networkidle2' });
    await page.screenshot({
        path: outputPath,
        fullPage: false
    });

    return 0;
}