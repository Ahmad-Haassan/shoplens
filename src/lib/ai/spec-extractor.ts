import { GoogleGenerativeAI } from '@google/generative-ai';
import { ProductSpecs } from '@/types';

export async function extractProductSpecs(title: string): Promise<ProductSpecs | null> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[extractProductSpecs] GEMINI_API_KEY not set.');
    return null;
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a product cataloging assistant for ShopLens AI.
Extract structured specifications from the following product title: "${title}".

Respond ONLY with a valid JSON object in the following format. Do not use Markdown formatting like \`\`\`json.
{
  "brand": "String (e.g. Samsung, Apple, Nike) or 'Unknown'",
  "model": "String (e.g. Galaxy A55, iPhone 15, Air Max) or 'Unknown'",
  "variant": "String (e.g. 8GB/256GB, 128GB, 5G) or null if none",
  "color": "String (e.g. Blue, Black) or null if none",
  "category": "String (e.g. Smartphone, Laptop, Clothing) or 'Unknown'"
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Strip markdown JSON wrapping if it exists
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    
    const parsed = JSON.parse(cleanedText) as ProductSpecs;
    return parsed;
  } catch (error) {
    console.error('[extractProductSpecs] Gemini API failed:', error);
    return null;
  }
}
