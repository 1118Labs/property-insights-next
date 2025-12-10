import { NextResponse } from "next/server";
import { fetchPropertyDetails } from "@/lib/enrichRentCast";
import { fetchZillowProperty } from "@/lib/zillow";
import { getMapSnapshot } from "@/lib/appleMaps";

type EnrichResponse = {
  addressNormalized: string;
  beds?: number;
  baths?: number;
  sqft?: number;
  lotSize?: number;
  yearBuilt?: number;
  latitude?: number;
  longitude?: number;
  estimatedValue?: number;
  valuationLow?: number;
  valuationHigh?: number;
  mapImageUrl?: string | null;
  provider: "rentcast" | "zillow" | "fallback";
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const address = typeof body?.address === "string" ? body.address.trim() : "";
    if (!address) {
      return NextResponse.json(
        { error: "invalid_address", message: "Address is required" },
        { status: 400 }
      );
    }

    const rentcast = await fetchPropertyDetails(address);
    if (rentcast) {
      const mapImageUrl =
        rentcast.latitude !== undefined && rentcast.longitude !== undefined
          ? await getMapSnapshot(rentcast.latitude, rentcast.longitude)
          : null;

      return NextResponse.json({
        addressNormalized: address,
        beds: rentcast.beds,
        baths: rentcast.baths,
        sqft: rentcast.squareFootage,
        lotSize: rentcast.lotSize,
        yearBuilt: rentcast.yearBuilt,
        latitude: rentcast.latitude,
        longitude: rentcast.longitude,
        estimatedValue: rentcast.estimatedValue,
        valuationLow: rentcast.valuationLow,
        valuationHigh: rentcast.valuationHigh,
        mapImageUrl: mapImageUrl || undefined,
        provider: "rentcast",
      } satisfies EnrichResponse);
    }

    const [street, city, state, postalCode] = address.split(",").map((s) => s.trim());
    const zillow = await fetchZillowProperty({
      street: street ?? "",
      city: city ?? "",
      state: state ?? "",
      postalCode,
    });

    if (zillow) {
      return NextResponse.json({
        addressNormalized: address,
        beds: undefined,
        baths: undefined,
        sqft: undefined,
        lotSize: undefined,
        yearBuilt: undefined,
        latitude: undefined,
        longitude: undefined,
        estimatedValue:
          typeof zillow.propertyValue === "number" ? zillow.propertyValue : undefined,
        valuationLow: undefined,
        valuationHigh: undefined,
        mapImageUrl: undefined,
        provider: "zillow",
      } satisfies EnrichResponse);
    }

    return NextResponse.json({
      addressNormalized: address,
      mapImageUrl: undefined,
      provider: "fallback",
    } satisfies EnrichResponse);
  } catch (err) {
    return NextResponse.json(
      { error: "server_error", message: err instanceof Error ? err.message : "Unknown" },
      { status: 500 }
    );
  }
}
