import { describe, expect, it } from "vitest";
import { buildQuote } from "@/lib/quotes/builder";
import { buildProfileFromRecord, mockProperty } from "@/lib/insights";

const baseProfile = buildProfileFromRecord(mockProperty("123 Quote St"));

describe("quote builder", () => {
  it("builds cleaning quote with items and totals", () => {
    const quote = buildQuote(baseProfile, "cleaning");
    expect(quote.items.length).toBeGreaterThan(0);
    expect(quote.total).toBeGreaterThan(0);
  });

  it("builds lawncare quote using yard size", () => {
    const quote = buildQuote(baseProfile, "lawncare");
    expect(quote.items.some((i) => i.label.toLowerCase().includes("mow"))).toBe(true);
  });

  it("adds confidence warning when low", () => {
    const profile = { ...baseProfile, insights: { ...baseProfile.insights, confidenceScore: 40 } };
    const quote = buildQuote(profile, "cleaning");
    expect(quote.confidenceWarnings?.length).toBeGreaterThan(0);
  });
});
