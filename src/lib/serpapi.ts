import { StoreResult, ProductSpecs } from '@/types';

// ─── Constants ───────────────────────────────────────────────────────────────

const EXCLUDED_DOMAINS = [
  'telemart.pk', 'ishopping.pk', 'symbios.pk',
  'priceoye.pk', 'propakistani.pk', 'hamariweb.com',
  'fonepaw.com', 'gsmarena.com', 'phonearena.com',
  'reddit.com', 'youtube.com', 'facebook.com',
  'instagram.com', 'twitter.com', 'wikipedia.org',
];

const PRIORITY_DOMAINS = ['daraz.pk', 'olx.com.pk', 'myshopify.com'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

/**
 * Cleans the raw scraped product title into a tight, search-ready string.
 * - Strips store suffix after | or — but KEEPS hyphens inside model names
 * - Strips colour/size variants that make the search too narrow
 * - Caps at 70 chars for query efficiency
 */
function buildSearchTitle(rawTitle: string): string {
  // Remove store suffixes: "Product Name | Daraz.pk" → "Product Name"
  let title = rawTitle.split(/\s*[|–—]\s*/)[0].trim();

  // Remove trailing parenthetical notes: "iPhone 15 (128GB, Black)" → "iPhone 15"
  // Actually, for electronics we WANT to keep specs — only strip very long ones
  if (title.length > 80) {
    // Remove colour/size variants at the end that inflate the query
    title = title.replace(/\s*[-(]\s*(black|white|blue|red|green|pink|gold|silver|grey|gray|navy|maroon|purple|beige|cream|nude|brown|olive|teal|cyan|magenta|yellow|orange|multicolor|multi)[^)]*[)]?\s*$/i, '').trim();
  }

  // Limit to ~60 characters but don't cut off in the middle of a word
  if (title.length > 60) {
    const spaceIndex = title.lastIndexOf(' ', 60);
    title = spaceIndex > 0 ? title.substring(0, spaceIndex) : title.substring(0, 60);
  }

  return title.trim();
}

/**
 * Extracts the most search-worthy tokens from the title.
 * For "Samsung Galaxy A55 5G 8GB/256GB" → ["Samsung", "Galaxy", "A55", "5G"]
 * For "Embroidered Lawn Suit 3-Piece"   → ["Embroidered", "Lawn", "Suit"]
 */
function extractKeyTokens(title: string): string[] {
  return title
    .replace(/[^\w\s]/g, ' ')  // remove punctuation
    .split(/\s+/)
    .filter(t => t.length > 1) // remove single chars
    .slice(0, 8);               // cap at 8 tokens
}

/**
 * Compute what fraction of the query tokens appear in the result title.
 * Returns 0–1. We use this to drop irrelevant results.
 */
function relevanceScore(queryTokens: string[], resultTitle: string): number {
  if (!resultTitle || queryTokens.length === 0) return 0;
  const lower = resultTitle.toLowerCase();
  const hits = queryTokens.filter(t => lower.includes(t.toLowerCase()));
  return hits.length / queryTokens.length;
}

function isDomainAllowed(domain: string): boolean {
  return !EXCLUDED_DOMAINS.some(ex => domain.includes(ex));
}

function isPriorityDomain(domain: string): boolean {
  return PRIORITY_DOMAINS.some(p => domain.includes(p));
}

function getFeaturesForDomain(domain: string): string[] {
  if (domain.includes('daraz'))  return ['Cash on Delivery', 'Free Shipping', 'DarazMall Verified', 'Easy Returns'];
  if (domain.includes('olx'))    return ['Direct from Seller', 'Negotiable Price', 'Local Pickup Available', 'Cash Payment'];
  if (domain.includes('myshopify') || domain.endsWith('.pk')) return ['Shopify Store', 'Secure Checkout', 'Direct from Seller'];
  return ['Online Store', 'See Store for Details'];
}

/** Extract price from snippet/title text */
function extractPrice(text: string): number {
  // Aggressively hunt for the first large number in the string
  // Matches 12,500.00 or 12500 or 12,500
  const match = text.match(/([\d]+[,\d]*)(?:\.\d+)?/);
  if (match && match[1]) {
    const p = Math.round(parseFloat(match[1].replace(/,/g, '')));
    // Only return if it's a reasonable PKR price (above 100 Rs)
    if (p > 100 && p < 10_000_000) return p;
  }
  return 0;
}

/** Fetch real image + price from Shopify JSON API */
async function fetchShopifyData(link: string): Promise<{ price: number; imageUrl: string | null }> {
  try {
    const urlObj = new URL(link);
    const parts = urlObj.pathname.split('/').filter(Boolean);
    const idx = parts.indexOf('products');
    if (idx !== -1 && parts[idx + 1]) {
      const handle = parts[idx + 1].split('?')[0];
      const apiUrl = `${urlObj.origin}/products/${handle}.json`;
      const res = await fetch(apiUrl, {
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShopLens/1.0)' },
        signal: AbortSignal.timeout(5000),
      });
      if (res.ok) {
        const json = await res.json() as { product: any };
        const p = json.product;
        return {
          price: parseFloat(p.variants?.[0]?.price || '0') || 0,
          imageUrl: p.images?.[0]?.src || null,
        };
      }
    }
  } catch {}
  return { price: 0, imageUrl: null };
}

/** Fetch og:image from a product page */
async function fetchOgImage(link: string): Promise<string | null> {
  try {
    const res = await fetch(link, {
      headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ShopLens/1.0)' },
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return null;
    const html = await res.text();
    const m = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i)
           || html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i);
    return m?.[1] || null;
  } catch {
    return null;
  }
}

// ─── Main export ─────────────────────────────────────────────────────────────

export async function searchAlternativeDeals(
  productTitle: string,
  originalUrl: string,
  originalPrice: number,
  minPrice: number | null,
  maxPrice: number | null,
  specs: ProductSpecs | null = null
): Promise<StoreResult[]> {
  const apiKey = process.env.SERPAPI_API_KEY;
  if (!apiKey) {
    console.warn('[SerpAPI] SERPAPI_API_KEY not set.');
    return [];
  }

  // ── Build a clean, precise search title ──
  let searchTitle = buildSearchTitle(productTitle);
  
  if (specs && specs.brand !== 'Unknown' && specs.model !== 'Unknown') {
    searchTitle = `${specs.brand} ${specs.model} ${specs.variant || ''}`.trim();
  }

  const queryTokens  = extractKeyTokens(searchTitle);

  console.log(`[SerpAPI] Product: "${productTitle}"`);
  console.log(`[SerpAPI] Search title: "${searchTitle}"`);
  console.log(`[SerpAPI] Key tokens: ${queryTokens.join(', ')}`);

  const originalDomain = (() => {
    try { return new URL(originalUrl).hostname.replace('www.', ''); } catch { return ''; }
  })();

  /**
   * Query strategy:
   * 1. Broad site search on Daraz
   * 2. General search across Pakistan
   * 3. Broad site search on OLX
   * 4. Google Shopping engine
   *
   * We rely on the `relevanceScore` (token overlap) to filter out bad results 
   * rather than using strict quotes, which fail if the scraped title isn't a 100% exact match.
   */
  const queries = [
    { url: `https://serpapi.com/search?engine=google&q=${encodeURIComponent(`${searchTitle} site:daraz.pk`)}&api_key=${apiKey}&gl=pk&hl=en&num=20`, type: 'organic' },
    { url: `https://serpapi.com/search?engine=google&q=${encodeURIComponent(`${searchTitle} buy online pakistan`)}&api_key=${apiKey}&gl=pk&hl=en&num=20`, type: 'organic' },
    { url: `https://serpapi.com/search?engine=google&q=${encodeURIComponent(`${searchTitle} site:olx.com.pk`)}&api_key=${apiKey}&gl=pk&hl=en&num=20`, type: 'organic' },
    { url: `https://serpapi.com/search?engine=google_shopping&q=${encodeURIComponent(searchTitle)}&api_key=${apiKey}&gl=pk&hl=en`, type: 'shopping' },
  ];

  let combinedResults: any[] = [];

  try {
    const fetches = queries.map(q =>
      fetch(q.url, { signal: AbortSignal.timeout(12000) })
        .then(r => r.ok ? r.json().then(data => ({ data, type: q.type })) : null)
        .catch(() => null)
    );

    const responses = await Promise.all(fetches);
    for (const res of responses) {
      if (!res?.data) continue;
      if (res.type === 'organic' && res.data.organic_results) {
        combinedResults.push(...res.data.organic_results);
      } else if (res.type === 'shopping' && res.data.shopping_results) {
        // Map shopping results to look like organic results for the rest of our pipeline
        const mapped = res.data.shopping_results.map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.price ? `Price: PKR ${item.extracted_price || item.price}` : '',
          extracted_price: item.extracted_price, // Will use this if available
          thumbnail: item.thumbnail
        }));
        combinedResults.push(...mapped);
      }
    }
  } catch (error) {
    console.error('[SerpAPI] Search failed:', error);
    return [];
  }

  if (combinedResults.length === 0) {
    console.warn('[SerpAPI] Zero results returned for all queries');
    return [];
  }

  console.log(`[SerpAPI] Raw results before filtering: ${combinedResults.length}`);

  // ── Deduplicate & filter ──
  const seenLinks = new Set<string>();
  type Candidate = { domain: string; title: string; link: string; price: number; relevance: number };
  const candidates: Candidate[] = [];

  for (const item of combinedResults) {
    const link: string = item.link || '';
    if (!link || seenLinks.has(link)) continue;

    let domain = '';
    try { domain = new URL(link).hostname.replace('www.', ''); } catch { continue; }

    if (domain === originalDomain) continue;
    if (!isDomainAllowed(domain)) continue;

    seenLinks.add(link);

    const snippet = (item.snippet || '') + ' ' + (item.title || '');
    const price = item.extracted_price || extractPrice(snippet);
    const resultTitle: string = item.title || link;

    // ── RELEVANCE CHECK: drop results that don't match the product ──
    const rel = relevanceScore(queryTokens, resultTitle);
    if (rel < 0.20) {
      console.log(`[SerpAPI] Dropped (low relevance ${(rel * 100).toFixed(0)}%): ${resultTitle.slice(0, 60)}`);
      continue;
    }

    // ── TIER-2 SPEC FILTER ──
    // If we have strict specs like variant (e.g. 128GB, 256GB), ensure we don't match wrong variants.
    if (specs && specs.variant) {
      // Find all variants in the original spec like "128GB", "256GB"
      const variantMatches = specs.variant.match(/\d+gb|\d+tb/ig) || [];
      const titleLower = resultTitle.toLowerCase();
      
      let variantMismatch = false;
      for (const v of variantMatches) {
        const lowerV = v.toLowerCase();
        // If the original has 256GB, but this title explicitly says 128GB, and DOES NOT say 256GB -> Mismatch!
        // This is a naive but effective check.
        if (titleLower.includes('gb') || titleLower.includes('tb')) {
          if (!titleLower.includes(lowerV)) {
             variantMismatch = true;
             break;
          }
        }
      }

      if (variantMismatch) {
         console.log(`[SerpAPI] Dropped (Spec Variant Mismatch): ${resultTitle.slice(0, 60)}`);
         continue;
      }
    }

    candidates.push({ domain, title: resultTitle, link, price, relevance: rel });
  }

  console.log(`[SerpAPI] After relevance filter: ${candidates.length} results`);

  // ── Sort: priority domains first, then by relevance descending ──
  candidates.sort((a, b) => {
    const aPriority = isPriorityDomain(a.domain) ? 1 : 0;
    const bPriority = isPriorityDomain(b.domain) ? 1 : 0;
    if (bPriority !== aPriority) return bPriority - aPriority;
    return b.relevance - a.relevance;
  });

  // ── Price-range filtering (and strictly remove zero-price results) ──
  let selection: Candidate[];
  if (minPrice || maxPrice) {
    selection = candidates.filter(p => {
      if (p.price === 0) return false; // Strictly require price
      if (minPrice && p.price < minPrice) return false;
      if (maxPrice && p.price > maxPrice) return false;
      return true;
    });
  } else if (originalPrice > 0) {
    const low    = candidates.filter(p => p.price > 0 && p.price <= originalPrice * 0.85);
    const same   = candidates.filter(p => p.price > originalPrice * 0.85 && p.price <= originalPrice * 1.15);
    const high   = candidates.filter(p => p.price > originalPrice * 1.15);
    // Distribute results, completely ignoring zero-price results
    selection = [...low.slice(0, 12), ...same.slice(0, 10), ...high.slice(0, 8)];
  } else {
    // Even if original price is 0, we only want actionable deals
    selection = candidates.filter(p => p.price > 0);
  }

  // Cap at 30
  selection = selection.slice(0, 30);

  console.log(`[SerpAPI] Final selection: ${selection.length} results`);

  // ── Enrich with real images & prices ──
  const enriched = await Promise.all(
    selection.map(async (item) => {
      let price = item.price;
      let imageUrl: string | null = null;

      if (item.domain.includes('myshopify') || item.domain.endsWith('.pk') && !item.domain.includes('daraz') && !item.domain.includes('olx')) {
        // Try Shopify JSON API for price + image
        const shopData = await fetchShopifyData(item.link);
        if (shopData.price > 0) price = shopData.price;
        imageUrl = shopData.imageUrl;
      }

      // For Daraz & OLX, fetch og:image
      if (!imageUrl && (item.domain.includes('daraz') || item.domain.includes('olx'))) {
        imageUrl = await fetchOgImage(item.link);
      }
      
      // If still no image but it came from Google Shopping, use that
      if (!imageUrl && (item as any).thumbnail) {
        imageUrl = (item as any).thumbnail;
      }

      return { ...item, price, imageUrl };
    })
  );

  return enriched.map(item => ({
    product: {
      url: item.link,
      store: item.domain,
      title: item.title,
      price: item.price,
      currency: 'PKR',
      imageUrl: item.imageUrl,
      rating: null,
      reviewCount: null,
      reviews: [],
    },
    analysis: {
      pros: [],
      cons: [],
      features: getFeaturesForDomain(item.domain),
      sentimentScore: 7,
      verdict: item.price > 0
        ? `Found on ${item.domain} for PKR ${item.price.toLocaleString()}. Click to see full product details.`
        : `Found on ${item.domain}. Visit the store to see the current price.`,
    },
    score: 0,
    isBestDeal: false,
  }));
}
