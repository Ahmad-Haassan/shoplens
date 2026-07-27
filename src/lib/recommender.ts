import { StoreResult, AnalysisReport } from '@/types';


/**
 * Weighted recommendation scoring per store result.
 *
 * Weights (must sum to 1):
 *   Price            → 34% 
 *   AI Sentiment     → 33% (Quality of text reviews)
 *   Original Ratings → 33% (Stars + Volume)
 */
export function scoreResults(results: StoreResult[]): StoreResult[] {
  if (results.length === 0) return results;

  const prices = results.map((r) => r.product.price).filter((p) => p > 0);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const scored = results.map((r) => {
    const price = r.product.price;

    // 1. Price score (34%)
    let priceScore = 0;
    if (price > 0) {
      priceScore = maxPrice === minPrice
        ? 100
        : ((maxPrice - price) / (maxPrice - minPrice)) * 100;
    }

    // 2. Sentiment score (33%) - already 0–10, scale to 0–100
    const sentimentScore = (r.analysis.sentimentScore / 10) * 100;

    // 3. Rating & Volume score (33%)
    // Base rating (0-5) is worth up to 70 points of this bucket.
    // Review count is log-scaled for the remaining 30 points.
    const starScore = r.product.rating ? (r.product.rating / 5) * 70 : 35; // default to 50% if unknown
    const reviews = r.product.reviewCount ?? 0;
    const volumeScore = Math.min((Math.log10(reviews + 1) / Math.log10(100)) * 30, 30);
    const totalRatingScore = starScore + volumeScore;

    const composite =
      (priceScore * 0.34) +
      (sentimentScore * 0.33) +
      (totalRatingScore * 0.33);

    // Generate reasoning tokens
    const reasons: string[] = [];
    if (priceScore > 90) reasons.push("lowest price");
    else if (priceScore > 70) reasons.push("highly competitive price");

    if (sentimentScore > 80) reasons.push("excellent AI review analysis");
    
    if (r.product.rating && r.product.rating >= 4.5) reasons.push("top-tier store ratings");
    if (reviews > 50) reasons.push("high review volume");

    let reasoning = "";
    if (reasons.length > 0) {
      reasoning = "Recommended for its " + reasons.join(", ") + ".";
    } else {
      reasoning = "Recommended as the most balanced option available.";
    }

    return { ...r, score: Math.round(composite), reasoning };
  });

  return scored;
}
