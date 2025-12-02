import { describe, expect, it } from "vitest";
import { generateServiceInsight, resolveActiveProfiles } from "@/lib/service_profiles";
import { PropertyRecord, PropertyInsight } from "@/lib/types";

const baseProperty: PropertyRecord = {
  address: { line1: "123 Test", city: "", province: "" },
  beds: 3,
  baths: 2,
  sqft: 1500,
  lotSizeSqft: 6000,
};

describe("service profiles", () => {
  it("resolves active profiles", () => {
    expect(resolveActiveProfiles()).toEqual(["cleaning"]);
    expect(resolveActiveProfiles("roofing")).toEqual(["roofing"]);
  });

  it("generates cleaning insights", () => {
    const core = { riskFlags: [] } as unknown as PropertyInsight;
    const insight = generateServiceInsight("cleaning", baseProperty, core, []);
    expect(insight.details.squareFootage).toBeGreaterThan(0);
  });

  it("caps lawncare estimates to lot size range", () => {
    const core = { riskFlags: [] } as unknown as PropertyInsight;
    const insight = generateServiceInsight("lawncare", { ...baseProperty, lotSizeSqft: 2000 }, core, []);
    const surfaceMix = insight.details.surfaceMix as { driveway: number };
    expect(surfaceMix.driveway).toBeLessThanOrEqual(2000);
  });

  it("gutter cleaning aligns perimeter", () => {
    const core = { riskFlags: [] } as unknown as PropertyInsight;
    const insight = generateServiceInsight("gutter_cleaning", baseProperty, core, []);
    expect(insight.details.linearFootage).toBeGreaterThan(0);
  });
});
