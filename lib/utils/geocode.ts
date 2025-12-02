import { getCache, setCache } from "@/lib/utils/cache";

type GeoResult = { latitude: number; longitude: number };

// Lightweight Nominatim-backed geocoder with caching and safe fallbacks
export async function geocodeAddress(address?: string): Promise<GeoResult | null> {
  if (!address) return null;

  const cacheKey = `geo:${address.toLowerCase()}`;
  const cached = getCache<GeoResult>(cacheKey);
  if (cached) return cached;

  // Avoid remote calls in test environments
  if (process.env.NODE_ENV === "test") {
    const stub = { latitude: 40.0, longitude: -73.0 };
    setCache(cacheKey, stub, 60 * 60 * 1000);
    return stub;
  }

  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}&limit=1`;
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 2000);
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "PropertyInsights/1.0 (+https://example.com)" },
      signal: controller.signal,
    });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const body = (await res.json()) as Array<{ lat: string; lon: string }>;
    if (body?.length) {
      const result = { latitude: Number(body[0].lat), longitude: Number(body[0].lon) };
      setCache(cacheKey, result, 6 * 60 * 60 * 1000);
      return result;
    }
    return null;
  } catch {
    clearTimeout(timeout);
    return null;
  }
}
