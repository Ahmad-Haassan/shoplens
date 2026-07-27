import * as cheerio from 'cheerio';
import { ProductData, Scraper } from '@/types';
import { extractTitleFromUrl } from './base-scraper';
import { scrapeWithPlaywright } from './playwright-scraper';

export class DarazScraper implements Scraper {
  storeName = 'Daraz.pk';

  canHandle(url: string): boolean {
    return url.includes('daraz.pk') || url.includes('daraz.com.bd');
  }

  async scrape(url: string): Promise<ProductData> {
    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
        signal: AbortSignal.timeout(9000),
      });

      let html = await response.text();
      let $ = cheerio.load(html);

      if (html.length < 10000 || $('title').text().toLowerCase().includes('robot') || html.includes('captcha')) {
        console.log('[DarazScraper] fetch() blocked or challenged, falling back to Playwright...');
        const playwrightCheerio = await scrapeWithPlaywright(url);
        if (playwrightCheerio) $ = playwrightCheerio;
      }

      let title = '';
      let price = 0;
      let imageUrl: string | null = null;
      let rating: number | null = null;
      let reviewCount: number | null = null;

      // ── 1. JSON-LD structured data ──
      $('script[type="application/ld+json"]').each((_, el) => {
        try {
          const raw = $(el).html() || '{}';
          const parsed = JSON.parse(raw);
          const nodes = Array.isArray(parsed) ? parsed : [parsed];
          for (const ld of nodes) {
            const items = ld['@graph'] ? ld['@graph'] : [ld];
            for (const item of items) {
              if (item['@type'] === 'Product' || (item.name && item.offers)) {
                if (!title && item.name) title = String(item.name).trim();
                if (!price) {
                  const offerPrice = item.offers?.price || item.offers?.lowPrice;
                  if (offerPrice) price = parseFloat(String(offerPrice).replace(/,/g, '')) || 0;
                }
                if (!imageUrl) {
                  const img = Array.isArray(item.image) ? item.image[0] : item.image;
                  if (img) imageUrl = typeof img === 'string' ? img : (img.url || null);
                }
                if (item.aggregateRating) {
                  rating = parseFloat(item.aggregateRating.ratingValue) || null;
                  reviewCount = parseInt(item.aggregateRating.reviewCount || item.aggregateRating.ratingCount) || null;
                }
              }
            }
          }
        } catch {}
      });

      // ── 2. og:title (product name before the | separator) ──
      if (!title) {
        const ogTitle = $('meta[property="og:title"]').attr('content') || '';
        title = ogTitle.split(/\s*[|–—]\s*/)[0].trim();
      }

      // ── 3. price meta ──
      if (!price) {
        const priceMeta = $('meta[property="product:price:amount"]').attr('content');
        if (priceMeta) price = parseFloat(priceMeta) || 0;
      }

      // ── 4. og:image ──
      if (!imageUrl) {
        imageUrl = $('meta[property="og:image"]').attr('content') || null;
      }

      // ── 5. Daraz-specific price selectors ──
      if (!price) {
        const priceText = $('[class*="pdp-price"]').first().text()
          || $('[class*="pdp_price"]').first().text()
          || $('[class*="price-box"]').first().text();
        const match = priceText.replace(/,/g, '').match(/[\d]+/);
        if (match) {
          const p = parseInt(match[0], 10);
          if (p > 100) price = p;
        }
      }

      // ── 6. H1 fallback for title ──
      if (!title) {
        const h1 = $('h1').first().text().trim();
        if (h1 && h1.length > 3) title = h1;
      }

      // ── 7. URL slug fallback ──
      if (!title || title.toLowerCase().includes('robot') || title.toLowerCase().includes('daraz')) {
        title = extractTitleFromUrl(url);
      }

      return {
        url,
        store: this.storeName,
        title: title.replace(/\s*[-|]\s*Daraz\.pk$/i, '').trim() || 'Daraz Product',
        price,
        currency: 'PKR',
        imageUrl,
        rating,
        reviewCount,
        reviews: [],
      };
    } catch (error) {
      console.error('[DarazScraper] Error:', error);
      throw new Error('Failed to scrape Daraz product page');
    }
  }

  async search(_query: string): Promise<ProductData[]> {
    return [];
  }
}
