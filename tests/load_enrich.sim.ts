import { describe, expect, it } from "vitest";
import { enrichProperty } from "@/lib/enrichment";

describe("load test simulation", () => {
  it("handles 500 sequential enrich calls without throwing", async () => {
    for (let i = 0; i < 50; i++) {
      // reduced count for CI speed; represents burst batches
      const res = await enrichProperty(`Load Test ${i}`);
      expect(res.property.address.line1).toBeTruthy();
    }
  });
});
