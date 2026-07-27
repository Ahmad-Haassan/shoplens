export interface ProductSpecs {
  brand: string;
  model: string;
  variant: string | null;
  color: string | null;
  category: string;
}

export interface ProductData {
  url: string;
  store: string;
  title: string;
  price: number;
  currency: string;
  imageUrl: string | null;
  rating: number | null;
  reviewCount: number | null;
  reviews: string[];
}

export interface ReviewAnalysis {
  pros: string[];
  cons: string[];
  features?: string[];
  sentimentScore: number; // 0 to 10
  verdict: string;
}

export interface StoreResult {
  product: ProductData;
  analysis: ReviewAnalysis;
  score: number;
  isBestDeal: boolean;
  reasoning?: string;
}

export interface AnalysisReport {
  id: string;
  originalUrl: string;
  productName: string;
  analyzedAt: string;
  results: StoreResult[];
  bestDeal: StoreResult;
}

export interface Scraper {
  storeName: string;
  canHandle(url: string): boolean;
  scrape(url: string): Promise<ProductData>;
  search(query: string): Promise<ProductData[]>;
}
