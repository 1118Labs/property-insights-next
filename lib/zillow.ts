// lib/zillow.ts

export type NormalizedAddress = {
  street: string;
  city: string;
  state: string;
  postalCode?: string;
  country?: string;
};

import { fetchPropertyDetails } from "./enrichRentCast";

export type EnrichedProperty = {
  propertyValue?: number | null;
  propertyMeta?: Record<string, unknown> | null;
};

/**
 * Generic Zillow / HasData lookup helper.
 *
 * NOTE:
 * - You MUST fill in the correct Zillow/HasData endpoint + query params
 *   based on your account docs.
 * - This function is defensive: if the shape doesn't match, it just
 *   returns nulls instead of crashing.
 */
export async function fetchZillowProperty(
  address: NormalizedAddress
): Promise<EnrichedProperty | null> {
  const apiKey = process.env.ZILLOW_API_KEY;

  if (!apiKey) {
    console.warn("ZILLOW_API_KEY is not set; skipping Zillow, using RentCast fallback.");
    return null;
  }

  const url = new URL("https://YOUR-ZILLOW-ENDPOINT-HERE");
  url.searchParams.set("street", address.street);
  url.searchParams.set("city", address.city);
  url.searchParams.set("state", address.state);
  if (address.postalCode) url.searchParams.set("postalCode", address.postalCode);
  if (address.country) url.searchParams.set("country", address.country);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
    });

    const text = await res.text();

    if (!res.ok) {
      console.error("Zillow lookup failed", res.status, text.slice(0, 200));
      return null;
    }

    let data: unknown;
    try {
      data = JSON.parse(text);
    } catch (err) {
      console.error("Zillow response was not JSON", text.slice(0, 200), err);
      return null;
    }

    if (!data || typeof data !== "object") return null;
    const value =
      (data as any).priceEstimate ??
      (data as any).zestimate ??
      (data as any).valuation?.amount ??
      null;

    if (value == null) {
      const rc = await fetchPropertyDetails(
        [address.street, address.city, address.state, address.postalCode]
          .filter(Boolean)
          .join(", ")
      );
      return rc
        ? { propertyValue: rc.estimatedValue ?? null, propertyMeta: rc }
        : null;
    }

    return {
      propertyValue: typeof value === "number" ? value : null,
      propertyMeta: data as Record<string, unknown>,
    };
  } catch (err) {
    console.error("Zillow lookup error", err);
    const rc = await fetchPropertyDetails(
      [address.street, address.city, address.state, address.postalCode]
        .filter(Boolean)
        .join(", ")
    );
    return rc ? { propertyValue: rc.estimatedValue ?? null, propertyMeta: rc } : null;
  }
}
