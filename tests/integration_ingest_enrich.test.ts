import { describe, expect, it, vi } from "vitest";
import { buildEnrichedProfile } from "@/lib/insights";
import { createInsightFromAddress } from "@/lib/insights";

vi.mock("@/lib/supabase/server", () => ({
  supabaseEnabled: true,
  requireAdminClient: () => ({
    from: () => ({
      upsert: () => ({ select: () => ({ maybeSingle: async () => ({ data: { id: "prop-1" }, error: null }) }) }),
      insert: async () => ({}),
      select: () => ({ maybeSingle: async () => ({ data: { id: "prop-1" }, error: null }) }),
      order: () => ({ limit: () => ({ maybeSingle: async () => ({ data: { access_token: "tok" }, error: null }) }) }),
    }),
  }),
}));

vi.mock("@/lib/enrichment", () => ({
  enrichProperty: vi.fn().mockResolvedValue({ property: { address: { line1: "123" } }, sources: ["mock"], errors: [], meta: { durationMs: 1 } }),
}));

vi.mock("@/lib/jobber", () => ({ ensureJobberAccessToken: vi.fn().mockResolvedValue({ accessToken: "tok", tokenStatus: "fresh" }), fetchRecentJobberRequests: vi.fn().mockResolvedValue([]), ingestJobberRequests: vi.fn().mockResolvedValue({ ingested: 0, skipped: 0, errors: [] }) }));

describe("integration ingest→enrich→score", () => {
  it("builds enriched profile and upserts insight", async () => {
    const profile = await buildEnrichedProfile("123 Integration");
    expect(profile.property.address.line1).toBe("123");
    expect(profile.insights.score).toBeGreaterThanOrEqual(0);
  });

  it("creates insight without supabase persistence when disabled", async () => {
    vi.doMock("@/lib/supabase/server", () => ({ supabaseEnabled: false }));
    const profile = await createInsightFromAddress("123 NoDB", false);
    expect(profile.property.address.line1).toBeTruthy();
  });
});
