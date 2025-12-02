import { AerialInsight } from "@/lib/types";
import { fetchTile } from "@/lib/mapper.engine";
import { segmentTile, estimateSqftFromCoverage } from "@/lib/aerial/segmentation";
import { geocodeAddress } from "@/lib/utils/geocode";
import { getCache, setCache } from "@/lib/utils/cache";
import { logEvent, recordProviderMetric } from "@/lib/utils/telemetry";

const DEFAULT_LAT = 40.0;
const DEFAULT_LON = -73.0;
const DEFAULT_ZOOM = 17;
const DEFAULT_SIZE = 512;

function buildStubInsight(): AerialInsight {
  return {
    provider: "stub",
    confidence: 75,
    yardSqft: 6200,
    drivewaySqft: 1800,
    roofSqft: 2200,
    treeDensity: 0.18,
    poolDetected: false,
  };
}

export async function runAerialInsights(address: string): Promise<AerialInsight & { warnings?: string[] }> {
  const cacheKey = address ? `aerial:${address.toLowerCase()}` : null;
  const cached = cacheKey ? getCache<AerialInsight & { warnings?: string[] }>(cacheKey) : null;
  if (cached) return cached;

  // In test environments, avoid network I/O and return deterministic data
  if (process.env.NODE_ENV === "test") {
    const stub = buildStubInsight();
    if (cacheKey) setCache(cacheKey, stub, 5 * 60 * 1000);
    return stub;
  }

  const warnings: string[] = [];
  const geo = await geocodeAddress(address).catch(() => null);
  const lat = geo?.latitude ?? DEFAULT_LAT;
  const lon = geo?.longitude ?? DEFAULT_LON;
  const zoom = DEFAULT_ZOOM;
  const size = DEFAULT_SIZE;

  try {
    const tile = await fetchTile({ lat, lon, zoom, size });
    const seg = segmentTile(tile.data);
    const yardSqft = estimateSqftFromCoverage(seg.areas.vegetation, zoom);
    const roofSqft = estimateSqftFromCoverage(seg.areas.roof, zoom);
    const drivewaySqft = estimateSqftFromCoverage(seg.areas.concrete, zoom);
    const treeDensity = Number((seg.areas.canopy || 0).toFixed(3));
    const poolDetected = seg.areas.water > 0.03;
    const poolShape = poolDetected ? (seg.areas.water > 0.08 ? "irregular" : "rectangular") : undefined;
    const confidence = Math.min(100, seg.confidence + (tile.provider === "apple" ? 10 : 0));
    const aerial: AerialInsight & { warnings?: string[] } = {
      provider: tile.provider,
      confidence,
      yardSqft,
      roofSqft,
      drivewaySqft,
      treeDensity,
      poolDetected,
      poolShape,
      warnings: warnings.length ? warnings : undefined,
    };
    if (cacheKey) setCache(cacheKey, aerial, 5 * 60 * 1000);
    recordProviderMetric(`tile.${tile.provider}`, seg.confidence, false);
    logEvent("aerial_insight", { address, provider: tile.provider, confidence });
    return aerial;
  } catch (err) {
    warnings.push(`aerial_unavailable: ${String(err)}`);
    recordProviderMetric("tile.fallback", 0, true, String(err));
    const fallback = { ...buildStubInsight(), warnings };
    if (cacheKey) setCache(cacheKey, fallback, 60 * 1000);
    return fallback;
  }
}
