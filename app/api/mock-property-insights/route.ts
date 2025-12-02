import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = await request.json();
  const { address } = body;

  const mockData = {
    address: address || "123 Main St, Southold, NY",
    beds: 3,
    baths: 2,
    sqft: 1450,
    lotSize: "0.5 acres",
    zestimate: 690000,
    images: [
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
      "https://placehold.co/600x400",
    ],
    source: "mock",
  };

  return NextResponse.json(mockData);
}
