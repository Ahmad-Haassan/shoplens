import { ProductData, Scraper } from '@/types';

export function extractTitleFromUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    const pathParts = urlObj.pathname.split('/').filter(Boolean);
    let lastPart = pathParts[pathParts.length - 1] || '';
    
    // Remove query params or hashes if somehow they made it here
    lastPart = lastPart.split('?')[0].split('#')[0];
    
    // Remove extensions like .html
    lastPart = lastPart.replace(/\.html?$/i, '');
    
    // Remove trailing IDs like -i123456 (common in Daraz) or other trailing number blocks
    lastPart = lastPart.replace(/-[a-z]?\d+.*$/i, '');
    
    // Convert hyphens to spaces and capitalize words
    const title = lastPart
      .replace(/-/g, ' ')
      .replace(/\b\w/g, char => char.toUpperCase());
      
    return title || 'Unknown Product';
  } catch {
    return 'Unknown Product';
  }
}
