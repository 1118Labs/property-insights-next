import { describe, expect, it, vi } from "vitest";

vi.mock("@/lib/enrichers/zillow", () => ({
  fetchZillow: () => Promise.resolve({ bedrooms: 3, bathrooms: 2, livingArea: 1200 }),
  mergeZillow: (r: { bedrooms?: number; bathrooms?: number }, p: Record<string, unknown>) => ({ ...p, beds: r.bedrooms, baths: r.bathrooms }),
}));
vi.mock("@/lib/enrichers/rentcast", () => ({
  fetchRentcast: () => Promise.resolve({ squareFootage: 1500, rentEstimate: 2200 }),
  mergeRentcast: (r: { squareFootage?: number; rentEstimate?: number }, p: Record<string, unknown>) => ({ ...p, sqft: r.squareFootage, rentEstimate: r.rentEstimate }),
}));

describe("provider mock preset", () => {
  it("loads with mocks without hitting network", async () => {
    const { enrichProperty } = await import("@/lib/enrichment");
    const result = await enrichProperty("123 Mock Ln");
    expect(result.property.beds).toBe(3);
  });
});
