import { GoogleGenerativeAI } from '@google/generative-ai';
import { ReviewAnalysis } from '@/types';

export async function analyzeReviews(title: string, price: number, reviews: string[]): Promise<ReviewAnalysis> {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    console.warn('[analyzeReviews] GEMINI_API_KEY not set. Falling back to simple keywords.');
    return fallbackAnalysis(reviews);
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are a smart shopping assistant for an app called ShopLens AI. 
Analyze the following product: "${title}" (Price: PKR ${price}).

Here are some reviews (if any):
${reviews.length > 0 ? reviews.map(r => "- " + r).join('\n') : "No reviews available."}

Respond ONLY with a valid JSON object in the following format. Do not use Markdown formatting like \`\`\`json.
{
  "pros": ["Pro 1", "Pro 2"],
  "cons": ["Con 1", "Con 2"],
  "sentimentScore": 8, // 0 to 10
  "verdict": "A concise, 1-2 sentence final verdict on whether this is a good buy, considering the product type and price."
}
`;

    const result = await model.generateContent(prompt);
    const text = result.response.text().trim();
    
    // Strip markdown JSON wrapping if it exists
    const cleanedText = text.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    
    const parsed = JSON.parse(cleanedText);
    
    return {
      pros: parsed.pros || [],
      cons: parsed.cons || [],
      sentimentScore: typeof parsed.sentimentScore === 'number' ? parsed.sentimentScore : 7,
      verdict: parsed.verdict || "Product available."
    };
  } catch (error) {
    console.error('[analyzeReviews] Gemini API failed:', error);
    return fallbackAnalysis(reviews);
  }
}

function fallbackAnalysis(reviews: string[]): ReviewAnalysis {
  if (!reviews || reviews.length === 0) {
    return {
      pros: [],
      cons: [],
      sentimentScore: 7,
      verdict: "Product found. Compare prices across stores to find the best deal."
    };
  }

  const allText = reviews.join(' ').toLowerCase();
  const pros: string[] = [];
  const cons: string[] = [];

  if (allText.includes('fast') || allText.includes('quick')) pros.push('Fast delivery');
  if (allText.includes('good') || allText.includes('great')) pros.push('Positive feedback');
  if (pros.length === 0) pros.push('Available for purchase');

  if (allText.includes('slow') || allText.includes('late')) cons.push('Shipping delays');
  if (allText.includes('bad') || allText.includes('poor')) cons.push('Quality complaints');

  const sentimentScore = cons.length === 0 ? 7.5 : (pros.length > cons.length ? 7 : 5.5);

  return {
    pros,
    cons,
    sentimentScore,
    verdict: `Based on ${reviews.length} review(s): ${pros[0]}. ${cons.length > 0 ? cons[0] + '.' : 'No major complaints.'}`
  };
}
