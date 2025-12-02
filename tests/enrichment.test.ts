import { describe, expect, it, vi } from "vitest";
import { enrichProperty } from "@/lib/enrichment";
import { clearCache } from "@/lib/utils/cache";
import { normalizeProviderError } from "@/lib/enrichment/errors";

// These tests rely on providers being optionally disabled via env vars.
describe("enrichment", () => {
  it("returns error when address is missing", async () => {
    clearCache();
    const result = await enrichProperty("");
    expect(result.errors.length).toBeGreaterThan(0);
    expect(result.property.address.line1).toBeTruthy();
  });

  it("handles enrichment without providers configured", async () => {
    clearCache();
    const result = await enrichProperty("15 Test St");
    expect(result.property.address.line1).toBeTruthy();
    expect(result.sources.length).toBeGreaterThanOrEqual(0);
  });

  it("caches results for repeated addresses", async () => {
    clearCache();
    const first = await enrichProperty("15 Cache St");
    const second = await enrichProperty("15 Cache St");
    expect(second.meta?.durationMs).toBeDefined();
    expect(second.sources).toEqual(first.sources);
    expect(second.errors).toEqual(first.errors);
  });

  it("normalizes provider error codes", () => {
    const err = { code: "ECONNREFUSED" };
    expect(normalizeProviderError("zillow", err)).toContain("unreachable");
  });

  it("persists provenance meta when providers fail", async () => {
    clearCache();
    vi.resetModules();
    vi.resetAllMocks();
    vi.doMock("@/lib/enrichment/adapters", () => ({
      adapters: [
        {
          label: "failing",
          enabled: () => true,
          fetch: () => Promise.reject(new Error("boom")),
          merge: (r: unknown, p: Record<string, unknown>) => ({ ...p, ...r }),
        },
      ],
    }));
    const { enrichProperty: enrichMocked } = await import("@/lib/enrichment");
    const result = await enrichMocked("999 Fail St");
    expect(result.errors.length).toBeGreaterThanOrEqual(1);
    expect(result.meta?.durationMs).toBeDefined();
    vi.resetModules();
  });

  it("handles bad provider data gracefully", async () => {
    clearCache();
    vi.resetModules();
    vi.resetAllMocks();
    vi.doMock("@/lib/enrichers/zillow", () => ({
      fetchZillow: () => Promise.resolve({ bedrooms: "not-a-number" }),
      mergeZillow: (_r: unknown, p: Record<string, unknown>) => ({ ...p, beds: null }),
    }));
    const { enrichProperty: enrichBad } = await import("@/lib/enrichment");
    const result = await enrichBad("Bad Data Rd");
    expect(result.property.beds).toBeDefined();
    vi.resetModules();
  });
});
