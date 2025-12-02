import { AerialInsight, PropertyProfile, PropertyRecord } from "@/lib/types";
import { buildProfileFromRecord, mockProperty } from "@/lib/insights";
import { scoreProperty } from "@/lib/scoring";
import { isNonEmptyString } from "@/lib/utils/validation";
import { logIngestionEvent } from "@/lib/utils/ingestion";
import { getCache, setCache } from "@/lib/utils/cache";
import { getCounters, incrCounter, logEvent, recordProviderMetric } from "@/lib/utils/telemetry";
import { normalizeProviderError } from "@/lib/enrichment/errors";
import { geocodeAddress } from "@/lib/utils/geocode";
import { describeCircuit, withRetry } from "@/lib/utils/retry";
import { adapters, EnrichmentAdapter } from "@/lib/enrichment/adapters";
import { runAerialInsights } from "@/lib/aerial";

export type EnrichmentResult = {
  property: PropertyRecord;
  sources: string[];
  errors: string[];
  aerial?: AerialInsight;
  meta?: {
    durationMs?: number;
    providerErrors?: Record<string, string>;
    qualityScore?: number;
    providerDurations?: Record<string, number>;
    cacheHit?: boolean;
    fallbackUsed?: boolean;
    circuitOpen?: boolean;
    aerialProvider?: string;
  };
};

export async function enrichProperty(address: string, options: { providers?: string[]; skipCache?: boolean } = {}): Promise<EnrichmentResult> {
  const cleanAddress = isNonEmptyString(address) ? address.trim() : "";
  const started = Date.now();
  let property = mockProperty(cleanAddress || "Unknown address");
  const sources: string[] = [];
  const errors: string[] = [];
  const providerErrors: Record<string, string> = {};
  const mergeSignals: number[] = [];
  const providerDurations: Record<string, number> = {};
  let aerial: AerialInsight | undefined;

  // lightweight cache for test/sandbox scenarios; bypass if no address
  const cacheKey = options.skipCache ? null : cleanAddress ? `enrich:${cleanAddress.toLowerCase()}` : null;
  const cached = cacheKey ? getCache<EnrichmentResult>(cacheKey) : null;
  if (cached) {
    return { ...cached, meta: { ...cached.meta, cacheHit: true } };
  }

  const tryProvider = async (adapter: EnrichmentAdapter, addressInput: string) => {
    const counterKey = `provider.${adapter.label}`;
    const counters = getCounters();
    if ((counters[counterKey] || 0) > 100) {
      const message = `${adapter.label}: rate limit exceeded (in-memory guard)`;
      errors.push(message);
      providerErrors[adapter.label] = message;
      return;
    }

    try {
      const startedAt = Date.now();
      const result = await withRetry(
        () => adapter.fetch(addressInput),
        { attempts: 3, delayMs: 120, backoffFactor: 2 },
        `provider:${adapter.label}`
      );
      if (!result) return;
      const beforeSqft = property.sqft || 0;
      property = adapter.merge(result, property);
      const afterSqft = property.sqft || 0;
      if (beforeSqft && afterSqft) {
        mergeSignals.push(Math.abs(afterSqft - beforeSqft));
      }
      sources.push(adapter.label);
      const duration = Date.now() - startedAt;
      providerDurations[adapter.label] = duration;
      recordProviderMetric(adapter.label, duration, false);
    } catch (err) {
      const message = normalizeProviderError(adapter.label, err);
      errors.push(message);
      providerErrors[adapter.label] = message;
      recordProviderMetric(adapter.label, 0, true, message);
      const circuit = describeCircuit(`provider:${adapter.label}`);
      if (circuit.open) {
        providerErrors[adapter.label] = `${message} (circuit open)`;
      }
    }
    incrCounter(counterKey);
  };

  if (cleanAddress) {
    const activeAdapters = adapters.filter((a) => {
      const enabled = a.enabled();
      if (!enabled) return false;
      if (options.providers && options.providers.length) {
        return options.providers.includes(a.label);
      }
      return true;
    });
    for (const adapter of activeAdapters) {
      await tryProvider(adapter, cleanAddress);
    }
    if (!activeAdapters.length) {
      errors.push("No enrichment adapters enabled");
    }
  } else {
    errors.push("address: missing or invalid");
  }

  // optional geocode enrichment (stubbed for now)
  try {
    const geo = await geocodeAddress(cleanAddress);
    if (geo) {
      property = { ...property, address: { ...property.address, latitude: geo.latitude, longitude: geo.longitude } };
    }
  } catch (err) {
    const geoErr = normalizeProviderError("geocode", err);
    errors.push(geoErr);
    providerErrors["geocode"] = geoErr;
  }

  // optional aerial enrichment (in-memory + static tiles)
  if (cleanAddress) {
    try {
      aerial = await runAerialInsights(cleanAddress);
      if (aerial?.yardSqft && !property.lotSizeSqft) {
        property.lotSizeSqft = Math.round(aerial.yardSqft);
      }
      if (aerial?.roofSqft && !property.sqft) {
        property.sqft = Math.round(aerial.roofSqft * 1.1);
      }
    } catch (err) {
      const aerialErr = normalizeProviderError("aerial", err);
      errors.push(aerialErr);
      providerErrors["aerial"] = aerialErr;
    }
  }

  scoreProperty(property);
  const result: EnrichmentResult = {
    property,
    sources,
    errors,
    meta: {
      durationMs: Date.now() - started,
      providerErrors: Object.keys(providerErrors).length ? providerErrors : undefined,
      qualityScore: mergeSignals.length ? Math.max(0, 100 - Math.min(50, mergeSignals.reduce((a, b) => a + b, 0) / mergeSignals.length)) : 100,
      providerDurations: Object.keys(providerDurations).length ? providerDurations : undefined,
      fallbackUsed: !sources.length,
      cacheHit: false,
      circuitOpen: Object.values(providerErrors).some((e) => e.includes("circuit open")),
      aerialProvider: aerial?.provider,
    },
    aerial,
  };

  if (cacheKey) {
    setCache(cacheKey, result, 2 * 60 * 1000); // 2 minute TTL
  }

  incrCounter("enrichment.runs");
  if (errors.length) incrCounter("enrichment.errors");
  logEvent("enrichment", { address: cleanAddress, sources, errors, duration: result.meta?.durationMs });

  return result;
}

export async function buildEnrichedProfile(address: string): Promise<PropertyProfile> {
  const baseProperty = mockProperty(address);
  const { property, sources, errors, meta, aerial } = await enrichProperty(address).catch(() => ({ property: baseProperty, sources: [], errors: [], meta: {}, aerial: undefined }));

  if (errors.length || sources.length) {
    await logIngestionEvent({
      source: "enrichment",
      status: errors.length ? "partial" : "success",
      detail: { sources, errors, address },
    }).catch(() => {});
  }

  const enrichment = { sources, errors, meta, aerial };
  return buildProfileFromRecord(property, undefined, undefined, enrichment, undefined, aerial);
}
