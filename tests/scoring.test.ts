import { describe, expect, it } from "vitest";
import { scoreProperty, buildRiskFlags } from "@/lib/scoring";
import { PropertyRecord } from "@/lib/types";

const baseProperty: PropertyRecord = {
  address: { line1: "123 Main" },
  beds: 3,
  baths: 2,
  sqft: 1800,
  lotSizeSqft: 6000,
  yearBuilt: 1995,
};

describe("scoring", () => {
  it("produces a score within 0-100 and valuations", () => {
    const { insight } = scoreProperty(baseProperty);
    expect(insight.score).toBeGreaterThanOrEqual(0);
    expect(insight.score).toBeLessThanOrEqual(100);
    expect(insight.valuation?.estimate).toBeGreaterThan(0);
    expect(insight.rentEstimate?.estimate).toBeGreaterThan(0);
  });

  it("penalizes missing bedrooms and small sqft", () => {
    const poorProperty: PropertyRecord = { address: { line1: "Tiny" }, beds: 1, baths: 1, sqft: 700 };
    const { insight } = scoreProperty(poorProperty);
    expect(insight.score).toBeLessThan(60);
  });

  it("adds risk flags for older or unknown age", () => {
    const oldProperty: PropertyRecord = { address: { line1: "Old" }, yearBuilt: 1950 };
    const unknownAge: PropertyRecord = { address: { line1: "Unknown" } };

    expect(buildRiskFlags(oldProperty).some((r) => r.code === "OLDER_HOME")).toBe(true);
    expect(buildRiskFlags(unknownAge).some((r) => r.code === "UNKNOWN_AGE")).toBe(true);
  });

  it("rewards newer, larger homes compared to older small ones", () => {
    const modern: PropertyRecord = { address: { line1: "Modern" }, beds: 4, baths: 3, sqft: 2500, yearBuilt: 2018 };
    const dated: PropertyRecord = { address: { line1: "Dated" }, beds: 2, baths: 1, sqft: 900, yearBuilt: 1955 };

    const modernScore = scoreProperty(modern).insight.score;
    const datedScore = scoreProperty(dated).insight.score;
    expect(modernScore).toBeGreaterThan(datedScore);
  });

  it("adds missing geo risk flag", () => {
    const noGeo: PropertyRecord = { address: { line1: "No City" } };
    const flags = buildRiskFlags(noGeo);
    expect(flags.some((f) => f.code === "MISSING_GEO")).toBe(true);
  });

  it("includes lotAppeal, ageFactor, and equityDelta in breakdown", () => {
    const { insight } = scoreProperty(baseProperty);
    expect(insight.breakdown.lotAppeal).toBeDefined();
    expect(insight.breakdown.ageFactor).toBeDefined();
    expect(insight.breakdown.equityDelta).toBeDefined();
    expect(insight.scoreVersion).toBeDefined();
  });
});
