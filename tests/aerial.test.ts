import { describe, expect, it } from "vitest";
import { runAerialInsights } from "@/lib/aerial";
import { estimateSqftFromCoverage, segmentTile } from "@/lib/aerial/segmentation";

describe("aerial insights", () => {
  it("returns deterministic stubbed insight in test env", async () => {
    const result = await runAerialInsights("123 Test Aerial");
    expect(result.provider).toBeTruthy();
    expect(result.yardSqft).toBeGreaterThan(0);
    expect(result.confidence).toBeGreaterThan(0);
  });

  it("segments tile with pseudo coverage", () => {
    const seg = segmentTile();
    expect(seg.areas.vegetation).toBeGreaterThan(0);
    expect(seg.confidence).toBeGreaterThan(0);
  });

  it("estimates sqft from coverage", () => {
    const sqft = estimateSqftFromCoverage(0.5, 17);
    expect(sqft).toBeGreaterThan(0);
  });
});
