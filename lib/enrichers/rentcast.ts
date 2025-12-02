import { PropertyRecord } from "@/lib/types";
import { toNumberOrNull, pickFirst } from "@/lib/utils/validation";
import { withRetry } from "@/lib/utils/retry";

export type RentcastResult = {
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  squareFootage?: number | null;
  lotSize?: number | null;
  yearBuilt?: number | null;
  estimatedValue?: number | null;
  rentEstimate?: number | null;
  photos?: string[] | null;
};

function buildRentcastUrl(address: string) {
  const url = new URL("https://api.rentcast.io/v1/avm/value");
  url.searchParams.set("address", address);
  return url.toString();
}

export async function fetchRentcast(address: string): Promise<RentcastResult | null> {
  if (process.env.MOCK_RENTCAST === "true") {
    return {
      address,
      city: "Mock City",
      state: "MC",
      zip: "00000",
      bedrooms: 3,
      bathrooms: 2,
      squareFootage: 1500,
      lotSize: 5000,
      estimatedValue: 500000,
      rentEstimate: 2200,
      photos: ["https://placehold.co/600x400"],
    };
  }
  if (!process.env.RENTCAST_API_KEY) {
    throw new Error("RentCast provider missing RENTCAST_API_KEY");
  }
  const url = buildRentcastUrl(address);

  return withRetry(async () => {
    const res = await fetch(url, {
      headers: {
        "X-Api-Key": process.env.RENTCAST_API_KEY,
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`RentCast failed (${res.status}): ${text}`);
    }

    const data = (await res.json()) as RentcastResult;
    return data;
  });
}

export function isRentcastResult(input: unknown): input is RentcastResult {
  if (!input || typeof input !== "object") return false;
  const obj = input as Record<string, unknown>;
  return "squareFootage" in obj || "rentEstimate" in obj;
}

export function mergeRentcast(result: RentcastResult, property: PropertyRecord): PropertyRecord {
  const cleaned: RentcastResult = {
    address: result.address?.trim() || null,
    city: result.city?.trim() || null,
    state: result.state?.trim() || null,
    zip: result.zip?.trim() || null,
    bedrooms: toNumberOrNull(result.bedrooms) ?? null,
    bathrooms: toNumberOrNull(result.bathrooms) ?? null,
    squareFootage: toNumberOrNull(result.squareFootage) ?? null,
    lotSize: toNumberOrNull(result.lotSize) ?? null,
    yearBuilt: toNumberOrNull(result.yearBuilt) ?? null,
    estimatedValue: toNumberOrNull(result.estimatedValue) ?? null,
    rentEstimate: toNumberOrNull(result.rentEstimate) ?? null,
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
    sqft: property.sqft ?? cleaned.squareFootage ?? undefined,
    lotSizeSqft: property.lotSizeSqft ?? cleaned.lotSize ?? undefined,
    yearBuilt: property.yearBuilt ?? cleaned.yearBuilt ?? undefined,
    images: property.images?.length ? property.images : cleaned.photos,
  };
}
// RentCast adapter fetches property AVM values. When API key is absent, returns null.
// Merge logic prefers existing property fields and fills gaps with provider values.
