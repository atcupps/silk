import express, { Request, Response } from 'express';
import {GoogleGenAI} from '@google/genai';
import { Link } from './types/interfaces';
import dotenv from 'dotenv';

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

    // Get a list of other country links
    const alternateLinks: Link[] = await generateAlternateLinks(link);
    console.log(alternateLinks);

    res.send(JSON.stringify(alternateLinks));
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