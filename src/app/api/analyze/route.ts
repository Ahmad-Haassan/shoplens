import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { z } from 'zod';
import { checkRateLimit } from '@/lib/rate-limiter';
import { scrapeProduct } from '@/lib/scrapers';
import { analyzeReviews } from '@/lib/ai/review-analyzer';
import { extractProductSpecs } from '@/lib/ai/spec-extractor';
import { scoreResults } from '@/lib/recommender';
import { StoreResult } from '@/types';
import { cacheSet } from '@/lib/cache';
import { extractTitleFromUrl } from '@/lib/scrapers/base-scraper';
import { createClient } from '@/lib/supabase/server';

const AnalyzeSchema = z.object({
  url: z.string().url(),
  minPrice: z.number().positive().nullable().optional(),
  maxPrice: z.number().positive().nullable().optional(),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    // ── Rate Limiting (5 requests for guest, 10 for logged-in per minute) ──
    const ip = request.headers.get('x-forwarded-for') || 'unknown';
    const limit = user ? 10 : 5;
    const rateLimit = checkRateLimit(ip, limit, 60000);
    if (!rateLimit.success) {
      return NextResponse.json({ error: 'Too many requests. Please wait a minute before trying again.' }, { status: 429 });
    }

    const body = await request.json();
    const validationResult = AnalyzeSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json({ error: 'Invalid input. Please provide a valid URL and ensure prices are positive numbers.' }, { status: 400 });
    }

    const { url, minPrice, maxPrice } = validationResult.data;

    let parsedUrl: URL;
    try {
      parsedUrl = new URL(url);
      
      // Security & Validation Guard
      if (['localhost', '127.0.0.1'].includes(parsedUrl.hostname)) {
        return NextResponse.json({ error: 'Localhost URLs are not supported. Please provide a valid public e-commerce link.' }, { status: 400 });
      }
      if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        return NextResponse.json({ error: 'Please provide a valid HTTP/HTTPS URL.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'Invalid URL format.' }, { status: 400 });
    }

    // ── 1. Scrape the source product page ──
    const sourceProduct = await scrapeProduct(url);

    console.log(`[analyze] Scraped title: "${sourceProduct.title}"`);
    console.log(`[analyze] Scraped price: ${sourceProduct.price}`);
    console.log(`[analyze] Scraped image: ${sourceProduct.imageUrl}`);

    // ── 2. Guard: if scraper returned a bad/generic title, use URL slug ──
    // Signs of a bad title: very short, contains the domain name, or says "Unknown"
    const domain = parsedUrl.hostname.replace('www.', '').split('.')[0];
    const titleLooksWrong =
      !sourceProduct.title ||
      sourceProduct.title.length < 4 ||
      sourceProduct.title.toLowerCase().includes('unknown') ||
      sourceProduct.title.toLowerCase() === domain.toLowerCase() ||
      sourceProduct.title.toLowerCase().includes('online store') ||
      sourceProduct.title.toLowerCase().includes('shop');

    if (titleLooksWrong) {
      const urlTitle = extractTitleFromUrl(url);
      console.warn(`[analyze] Title looks wrong ("${sourceProduct.title}"), using URL slug: "${urlTitle}"`);
      sourceProduct.title = urlTitle;
    }

    // 2. Analyze reviews from the source product with AI
    const sourceAnalysis = await analyzeReviews(sourceProduct.title, sourceProduct.price, sourceProduct.reviews);

    // ── 3. Extract Specs with AI ──
    const specs = await extractProductSpecs(sourceProduct.title);
    if (specs) {
      console.log(`[analyze] AI Extracted Specs: ${JSON.stringify(specs)}`);
    }

    // ── 4. Build primary result ──
    const primaryResult: StoreResult = {
      product: sourceProduct,
      analysis: sourceAnalysis,
      score: 0,
      isBestDeal: false,
    };

    // ── 5. Cross-store search via SerpAPI ──
    const { searchAlternativeDeals } = require('@/lib/serpapi');
    const crossStoreResults: StoreResult[] = await searchAlternativeDeals(
      sourceProduct.title,
      url,
      sourceProduct.price,
      minPrice ?? null,
      maxPrice ?? null,
      specs
    );

    const allResults = [primaryResult, ...crossStoreResults];

    // ── 6. Score all results ──
    const scored = scoreResults(allResults);

    const bestDeal = scored.reduce((prev, current) =>
      prev.score > current.score ? prev : current
    );
    bestDeal.isBestDeal = true;

    // ── 7. Build & cache report ──
    const reportId = uuidv4();
    const report = {
      id: reportId,
      originalUrl: url,
      productName: sourceProduct.title,
      analyzedAt: new Date().toISOString(),
      results: scored,
      bestDeal,
    };

    cacheSet(reportId, report);

    return NextResponse.json({ success: true, reportId, data: report }, { status: 200 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unexpected error.';
    console.error('[/api/analyze]', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
