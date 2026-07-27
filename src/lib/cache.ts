/**
 * Hybrid cache: in-memory (fast) + filesystem fallback (survives server restarts).
 *
 * Files are stored in <project-root>/.next/cache/shoplens/
 * In production, swap for Redis (Upstash) for distributed caching.
 *
 * Key: report ID (uuid)
 * Value: { data, expiresAt }
 */

import path from 'path';
import fs from 'fs';

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const memCache = new Map<string, CacheEntry<unknown>>();
const DEFAULT_TTL_MS = 4 * 60 * 60 * 1000; // 4 hours

// Filesystem cache dir (inside .next so it's always writable in dev & prod)
const CACHE_DIR = path.join(process.cwd(), '.next', 'cache', 'shoplens');

function ensureCacheDir() {
  try {
    if (!fs.existsSync(CACHE_DIR)) {
      fs.mkdirSync(CACHE_DIR, { recursive: true });
    }
  } catch {}
}

function filePath(key: string): string {
  // Sanitise key so it's safe as a filename
  return path.join(CACHE_DIR, `${key.replace(/[^a-zA-Z0-9-_]/g, '_')}.json`);
}

export function cacheSet<T>(key: string, data: T, ttlMs = DEFAULT_TTL_MS): void {
  const entry: CacheEntry<T> = { data, expiresAt: Date.now() + ttlMs };

  // Write to memory
  memCache.set(key, entry as CacheEntry<unknown>);

  // Persist to disk
  try {
    ensureCacheDir();
    fs.writeFileSync(filePath(key), JSON.stringify(entry), 'utf-8');
  } catch (e) {
    console.warn('[cache] disk write failed:', (e as Error).message);
  }
}

export function cacheGet<T>(key: string): T | null {
  // 1. Check memory first
  const mem = memCache.get(key) as CacheEntry<T> | undefined;
  if (mem) {
    if (Date.now() > mem.expiresAt) {
      memCache.delete(key);
      // also delete from disk
      try { fs.unlinkSync(filePath(key)); } catch {}
      return null;
    }
    return mem.data;
  }

  // 2. Try disk (e.g. after server restart)
  try {
    const fp = filePath(key);
    if (fs.existsSync(fp)) {
      const raw = fs.readFileSync(fp, 'utf-8');
      const entry = JSON.parse(raw) as CacheEntry<T>;
      if (Date.now() > entry.expiresAt) {
        fs.unlinkSync(fp);
        return null;
      }
      // Restore to memory
      memCache.set(key, entry as CacheEntry<unknown>);
      return entry.data;
    }
  } catch {}

  return null;
}

export function cacheDelete(key: string): void {
  memCache.delete(key);
  try { fs.unlinkSync(filePath(key)); } catch {}
}
