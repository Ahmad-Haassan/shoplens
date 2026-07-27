import { ProductData, Scraper } from '@/types';
import { DarazScraper } from './daraz';
import { ShopifyPKScraper } from './shopify-pk';
import { GenericScraper } from './generic';

// Only Daraz, Shopify-based stores, and a Generic fallback are supported
// (Telemart, iShopping, Symbios removed per product decision)
export const scraperRegistry: Scraper[] = [
  new DarazScraper(),
  new ShopifyPKScraper(),
];

/**
 * Given a URL, finds the right scraper and returns scraped product data.
 * Falls back to GenericScraper if no specific scraper is found.
 */
export async function scrapeProduct(url: string): Promise<ProductData> {
  const scraper = scraperRegistry.find((s) => s.canHandle(url)) || new GenericScraper();
  return scraper.scrape(url);
}

/**
 * Returns the store name for a given URL without scraping.
 */
export function detectStore(url: string): string | null {
  const scraper = scraperRegistry.find((s) => s.canHandle(url));
  return scraper ? scraper.storeName : new URL(url).hostname.replace('www.', '');
}
