import { chromium } from 'playwright';
import * as cheerio from 'cheerio';

export async function scrapeWithPlaywright(url: string): Promise<cheerio.CheerioAPI | null> {
  let browser;
  try {
    browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    
    // Set a reasonable timeout and wait for network idle to ensure JS renders
    await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
    
    // Wait for the title or body to be present
    await page.waitForSelector('body', { timeout: 5000 });

    const html = await page.content();
    return cheerio.load(html);
  } catch (error) {
    console.error('[Playwright] Failed to scrape:', error);
    return null;
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
