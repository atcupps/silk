import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const API_KEY = process.env.GOOGLE_API_KEY!;
const CX = process.env.GOOGLE_CX!;

export async function searchProductImage(productName: string): Promise<string | null> {
  const url = `https://www.googleapis.com/customsearch/v1?q=${encodeURIComponent(
    productName
  )}&cx=${CX}&key=${API_KEY}&searchType=image`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    return data.items[0].link;
  } else {
    return null;
  }
}
