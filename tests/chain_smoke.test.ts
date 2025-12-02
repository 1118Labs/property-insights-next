import { describe, expect, it } from "vitest";
import { enrichProperty } from "@/lib/enrichment";
import { scoreProperty } from "@/lib/scoring";
import { PropertyRecord } from "@/lib/types";

// Smoke test to ensure enrichment output can feed scoring without runtime errors.
describe("ingestion → enrichment → scoring chain", () => {
  it("produces a scored profile from enrichment output", async () => {
    const enrich = await enrichProperty("999 Chain Ave");
    expect(enrich.property.address.line1).toBeTruthy();
    const { insight } = scoreProperty(enrich.property as PropertyRecord);
    expect(insight.score).toBeGreaterThanOrEqual(0);
    expect(insight.breakdown.livability).toBeDefined();
  });
});
