import { PropertyRecord } from "@/lib/types";
import { toNumberOrNull, pickFirst } from "@/lib/utils/validation";
import { withRetry } from "@/lib/utils/retry";

// Placeholder for Zillow-style enrichment via RapidAPI or internal proxy. If env missing, returns null.
export type ZillowResult = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  livingArea?: number | null;
  lotAreaValue?: number | null;
  yearBuilt?: number | null;
  zestimate?: number | null;
  rentZestimate?: number | null;
  photos?: string[] | null;
};

export async function fetchZillow(address: string): Promise<ZillowResult | null> {
  if (process.env.MOCK_ZILLOW === "true") {
    return {
      address,
      city: "Mock City",
      state: "MC",
      zip: "00000",
      bedrooms: 3,
      bathrooms: 2,
      livingArea: 1500,
      lotAreaValue: 5000,
      yearBuilt: 2005,
      zestimate: 520000,
      rentZestimate: 2300,
      photos: ["https://placehold.co/600x400"],
    };
  }
  if (!process.env.ZILLOW_API_URL || !process.env.ZILLOW_API_KEY) {
    throw new Error("Zillow provider missing ZILLOW_API_URL or ZILLOW_API_KEY");
  }
  const url = new URL(process.env.ZILLOW_API_URL);
  url.searchParams.set("address", address);
  return withRetry(async () => {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${process.env.ZILLOW_API_KEY}`,
      },
      cache: "no-store",
    });
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Zillow fetch failed (${res.status}): ${text}`);
    }
    return (await res.json()) as ZillowResult;
  });
}

export function isZillowResult(input: unknown): input is ZillowResult {
  if (!input || typeof input !== "object") return false;
  const obj = input as Record<string, unknown>;
  return "bedrooms" in obj || "bathrooms" in obj || "livingArea" in obj;
}

export function mergeZillow(result: ZillowResult, property: PropertyRecord): PropertyRecord {
  const cleaned: ZillowResult = {
    address: result.address?.trim() || null,
    city: result.city?.trim() || null,
    state: result.state?.trim() || null,
    zip: result.zip?.trim() || null,
    bedrooms: toNumberOrNull(result.bedrooms) ?? null,
    bathrooms: toNumberOrNull(result.bathrooms) ?? null,
    livingArea: toNumberOrNull(result.livingArea) ?? null,
    lotAreaValue: toNumberOrNull(result.lotAreaValue) ?? null,
    yearBuilt: toNumberOrNull(result.yearBuilt) ?? null,
    zestimate: toNumberOrNull(result.zestimate) ?? null,
    rentZestimate: toNumberOrNull(result.rentZestimate) ?? null,
    photos: result.photos ?? null,
  };

  return {
    ...property,
    address: {
      ...property.address,
      line1: pickFirst(property.address.line1, cleaned.address) || "",
      city: pickFirst(property.address.city, cleaned.city) || undefined,
      province: pickFirst(property.address.province, cleaned.state) || undefined,
      postalCode: pickFirst(property.address.postalCode, cleaned.zip) || undefined,
    },
    beds: property.beds ?? cleaned.bedrooms ?? undefined,
    baths: property.baths ?? cleaned.bathrooms ?? undefined,
    sqft: property.sqft ?? cleaned.livingArea ?? undefined,
    lotSizeSqft: property.lotSizeSqft ?? cleaned.lotAreaValue ?? undefined,
    yearBuilt: property.yearBuilt ?? cleaned.yearBuilt ?? undefined,
    images: property.images?.length ? property.images : cleaned.photos,
  };
}
// Zillow-style adapter; requires ZILLOW_API_URL and ZILLOW_API_KEY. Returns null when unavailable.
// Merge logic avoids overwriting existing property fields unless provider supplies values.
