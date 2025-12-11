import { logError, logInfo } from "@/lib/logging";

export type RentcastResponse = {
  beds?: number;
  baths?: number;
  squareFootage?: number;
  lotSize?: number;
  yearBuilt?: number;
  latitude?: number;
  longitude?: number;
  estimatedValue?: number;
  valuationLow?: number;
  valuationHigh?: number;
};

export async function fetchPropertyDetails(
  addressString: string
): Promise<RentcastResponse | null> {
  const apiKey = process.env.RENTCAST_API_KEY;
  if (!apiKey) {
    logInfo("rentcast.skip", "RENTCAST_API_KEY is not set; skipping lookup.");
    return null;
  }

  try {
    const url = new URL("https://api.rentcast.io/v1/properties");
    url.searchParams.set("address", addressString);

    const res = await fetch(url.toString(), {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
      cache: "no-store",
    });

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
    if (!payload || typeof payload !== "object") return null;

    const pickNumber = (...vals: unknown[]) => {
      for (const v of vals) {
        if (typeof v === "number" && Number.isFinite(v)) return v;
      }
      return undefined;
    };

    const normalize = (value: number | undefined) =>
      typeof value === "number" && Number.isFinite(value) ? value : undefined;

    return {
      beds: normalize(pickNumber((payload as any).bedrooms, (payload as any).beds)),
      baths: normalize(pickNumber((payload as any).bathrooms, (payload as any).baths)),
      squareFootage: normalize(
        pickNumber(
          (payload as any).squareFeet,
          (payload as any).sqft,
          (payload as any).livingAreaSqFt
        )
      ),
      lotSize: normalize(
        pickNumber(
          (payload as any).lotSizeSqFt,
          (payload as any).lotSize,
          (payload as any).lotSizeSquareFeet
        )
      ),
      yearBuilt: normalize(pickNumber((payload as any).yearBuilt, (payload as any).builtYear)),
      latitude: normalize(
        pickNumber(
          (payload as any).latitude,
          (payload as any).lat,
          (payload as any).location?.lat
        )
      ),
      longitude: normalize(
        pickNumber(
          (payload as any).longitude,
          (payload as any).lng,
          (payload as any).location?.lng
        )
      ),
      estimatedValue: normalize(
        pickNumber(
          (payload as any).priceEstimate,
          (payload as any).value,
          (payload as any).estimatedValue,
          (payload as any).valueEstimate,
          (payload as any).zestimate
        )
      ),
      valuationLow: normalize(
        pickNumber((payload as any).valueEstimateMin, (payload as any).valuationLow)
      ),
      valuationHigh: normalize(
        pickNumber((payload as any).valueEstimateMax, (payload as any).valuationHigh)
      ),
    };
  } catch (err) {
    logError("rentcast.exception", "RentCast lookup error", {
      error: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}
