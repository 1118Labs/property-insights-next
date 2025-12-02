export type CacheEntry<T> = { value: T; expiresAt: number };

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const store = new Map<string, CacheEntry<unknown>>();

const TTL_CONFIG: Record<string, number> = {
  insights: Number(process.env.CACHE_TTL_INSIGHTS_MS || 5 * 60 * 1000),
  quotes: Number(process.env.CACHE_TTL_QUOTES_MS || 5 * 60 * 1000),
  aerial: Number(process.env.CACHE_TTL_AERIAL_MS || 2 * 60 * 1000),
  schedule: Number(process.env.CACHE_TTL_SCHEDULE_MS || 10 * 60 * 1000),
  portal: Number(process.env.CACHE_TTL_PORTAL_MS || 5 * 60 * 1000),
};

export function setCache<T>(key: string, value: T, ttlMs = DEFAULT_TTL_MS) {
  const expiresAt = Date.now() + ttlMs;
  store.set(key, { value, expiresAt });
}

export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function clearCache() {
  store.clear();
}

export function getTTL(key: keyof typeof TTL_CONFIG) {
  return TTL_CONFIG[key] ?? DEFAULT_TTL_MS;
}
