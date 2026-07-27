import * as cheerio from 'cheerio';
import { ProductData, Scraper } from '@/types';
import { extractTitleFromUrl } from './base-scraper';
import { scrapeWithPlaywright } from './playwright-scraper';

export class GenericScraper implements Scraper {
  storeName = 'Generic Web Store';

  canHandle(_url: string): boolean {
    return true; // Catch-all for any URL
  }

  async scrape(url: string): Promise<ProductData> {
    let title = '';
    let price = 0;
    let imageUrl: string | null = null;
    let storeName = 'Unknown Store';

    try {
      storeName = new URL(url).hostname.replace('www.', '');
    } catch {}

    try {
      const response = await fetch(url, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
          'Cache-Control': 'no-cache',
        },
        signal: AbortSignal.timeout(9000),
      });

      if (response.ok) {
        let html = await response.text();
        let $ = cheerio.load(html);

        if (html.length < 5000 || html.includes('captcha') || $('title').text().toLowerCase().includes('robot')) {
          console.log(`[GenericScraper] fetch() blocked for ${storeName}, falling back to Playwright...`);
          const playwrightCheerio = await scrapeWithPlaywright(url);
          if (playwrightCheerio) $ = playwrightCheerio;
        }

        // ── 1. JSON-LD structured data (most reliable — product schema) ──
        $('script[type="application/ld+json"]').each((_, el) => {
          try {
            const raw = $(el).html() || '{}';
            const parsed = JSON.parse(raw);
            const nodes = Array.isArray(parsed) ? parsed : [parsed];
            for (const ld of nodes) {
              // Handle @graph arrays (common in Shopify)
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
                    if (img) {
                      imageUrl = typeof img === 'string' ? img : (img.url || img.contentUrl || null);
                    }
                  }
                }
              }
            }
          } catch {}
        });

        // ── 2. og:title is usually the PRODUCT name (not store name) ──
        if (!title) {
          const ogTitle = $('meta[property="og:title"]').attr('content') || '';
          // og:title for product pages is typically "Product Name | Store"
          // We want the part BEFORE the separator
          if (ogTitle) {
            title = ogTitle.split(/\s*[|–—]\s*/)[0].trim();
          }
        }

        // ── 3. og:image ──
        if (!imageUrl) {
          imageUrl = $('meta[property="og:image"]').attr('content') ||
                     $('meta[property="og:image:url"]').attr('content') || null;
        }

        // ── 4. product:price meta ──
        if (!price) {
          const priceMeta = $('meta[property="product:price:amount"]').attr('content');
          if (priceMeta) price = parseFloat(priceMeta) || 0;
        }

        // ── 5. Twitter card title ──
        if (!title) {
          const twitterTitle = $('meta[name="twitter:title"]').attr('content') || '';
          if (twitterTitle) title = twitterTitle.split(/\s*[|–—]\s*/)[0].trim();
        }

        // ── 6. The most prominent h1 on the page (product title) ──
        if (!title) {
          const h1 = $('h1').first().text().trim();
          if (h1 && h1.length > 3 && h1.length < 200) title = h1;
        }

        // ── 7. Common price selectors ──
        if (!price) {
          const priceSelectors = [
            '[class*="product-price"]', '[class*="ProductPrice"]',
            '[class*="sale-price"]', '[class*="SalePrice"]',
            '[id*="price"]', '[class*="price__current"]',
            '[class*="price-item--sale"]', '[data-price]',
            '[class*="price"]',
          ];
          for (const sel of priceSelectors) {
            const el = $(sel).first();
            const dataPrice = el.attr('data-price');
            const text = dataPrice || el.text().trim();
            const match = text.replace(/,/g, '').match(/[\d]+(?:\.\d{1,2})?/);
            if (match) {
              const p = parseFloat(match[0]);
              if (p > 100 && p < 10_000_000) { price = p; break; }
            }
          }
        }

        // ── 8. Never use page <title> — it always contains the store name ──
        // Fallback to URL slug only if nothing else worked
        if (!title || title.length < 3) {
          title = extractTitleFromUrl(url);
        }
      }
    } catch (e) {
      console.warn(`[GenericScraper] fetch failed for ${storeName}:`, (e as Error).message);
      // Last resort: extract from URL slug
      if (!title) title = extractTitleFromUrl(url);
    }

    return {
      url,
      store: storeName,
      title: title || 'Unknown Product',
      price,
      currency: 'PKR',
      imageUrl,
      rating: null,
      reviewCount: null,
      reviews: [],
    };
  }

  async search(_query: string): Promise<ProductData[]> {
    return [];
  }
}
