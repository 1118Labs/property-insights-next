// lib/rentcast.ts
//
// Lightweight RentCast helper to enrich property details defensively.

import { logError, logInfo } from "@/lib/logging";
import { RentcastEnrichment } from "@/lib/types";

type RentcastAddressInput = {
  line1: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
};

function asRecord(value: unknown): Record<string, unknown> | undefined {
  return typeof value === "object" && value !== null
    ? (value as Record<string, unknown>)
    : undefined;
}

function pickNumber(...values: unknown[]): number | undefined {
  for (const value of values) {
    if (typeof value === "number") return value;
  }
  return undefined;
}

function pickString(...values: unknown[]): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value;
  }
  return undefined;
}

function mapRentcastPayload(payload: unknown): RentcastEnrichment {
  const base: RentcastEnrichment = { provider: "rentcast" };
  const source = asRecord(payload);
  if (!source) return base;

  const property = asRecord(source.property);
  const buildingArea = asRecord(property?.buildingArea);
  const valuation = asRecord(source.valuation);
  const rentalValuation = asRecord(source.rentalValuation);
  const location = asRecord(source.location);
  const coordinates = asRecord(source.coordinates);
  const lot = asRecord(source.lot);

  const beds = pickNumber(
    source.beds,
    source.bedrooms,
    source.bedroom,
    property?.bedrooms
  );

  const baths = pickNumber(
    source.baths,
    source.bathrooms,
    source.bathroom,
    property?.bathrooms
  );

  const sqft = pickNumber(
    source.sqft,
    source.squareFeet,
    source.livingAreaSqFt,
    source.buildingSize,
    source.size,
    buildingArea?.value
  );

  const lotSizeSqft = pickNumber(
    source.lotSizeSqft,
    source.lotSize,
    source.lotSizeSquareFeet,
    lot?.sizeSqFt
  );

  const yearBuilt = pickNumber(
    source.yearBuilt,
    source.builtYear,
    property?.yearBuilt
  );

  const propertyType = pickString(
    source.propertyType,
    source.type,
    property?.type,
    source.propertyTypeGroup
  );

  const estRent = pickNumber(
    source.rentEstimate,
    source.estimatedRent,
    source.rentzestimate,
    rentalValuation?.amount,
    source.avmRentalValue
  );

  const estValue = pickNumber(
    source.valueEstimate,
    source.estimatedValue,
    source.priceEstimate,
    source.zestimate,
    valuation?.amount,
    source.avmValue
  );

  const latitude = pickNumber(
    source.latitude,
    source.lat,
    location?.lat,
    coordinates?.latitude
  );

  const longitude = pickNumber(
    source.longitude,
    source.lng,
    location?.lng,
    coordinates?.longitude
  );

  return {
    provider: "rentcast",
    beds,
    baths,
    sqft,
    lotSizeSqft,
    yearBuilt,
    propertyType,
    estRent,
    estValue,
    latitude,
    longitude,
    raw: payload,
  };
}

export async function fetchRentcastInsight(
  address: RentcastAddressInput,
  timeoutMs = 8000
): Promise<RentcastEnrichment | null> {
  const apiKey = process.env.RENTCAST_API_KEY;

  if (!apiKey) {
    logInfo("rentcast.skip", "API key missing; skipping RentCast enrichment.");
    return null;
  }

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    const url = new URL("https://api.rentcast.io/v1/properties/address");
    url.searchParams.set("address", address.line1);
    url.searchParams.set("city", address.city);
    url.searchParams.set("state", address.state);
    if (address.postalCode) url.searchParams.set("postalCode", address.postalCode);
    if (address.country) url.searchParams.set("country", address.country);

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      cache: "no-store",
      signal: controller.signal,
    });
    clearTimeout(timer);

    const text = await res.text();

    if (!res.ok) {
      logError("rentcast.error", "RentCast lookup failed", {
        status: res.status,
        body: text.slice(0, 200),
      });
      return null;
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      logError("rentcast.error", "RentCast response was not JSON", {
        body: text.slice(0, 200),
      });
      return null;
    }

    const payload = Array.isArray(data) ? data[0] : data;
    if (!payload) {
      logInfo("rentcast.empty", "RentCast returned empty payload", { address });
      return null;
    }

    return mapRentcastPayload(payload);
  } catch (err) {
    logError("rentcast.exception", "RentCast lookup error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
