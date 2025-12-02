import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildEnrichedProfile } from "@/lib/insights";
import * as supabaseServer from "@/lib/supabase/server";

// Mock Supabase admin client to capture upserts
type TableStore = Record<string, Record<string, unknown>[]>;
const store: TableStore = { properties: [], property_insights: [] };

function mockAdmin() {
  const client: unknown = {
    from: (table: string) => ({
      upsert: (payload: Record<string, unknown>) => {
        store[table] = store[table] || [];
        const row = Array.isArray(payload) ? payload[0] : payload;
        store[table].push(row);
        return {
          select: () => ({
          maybeSingle: () => Promise.resolve({ data: { id: `${table}-id-${store[table].length}` }, error: null }),
        }),
        };
      },
      select: () => ({
        maybeSingle: () => Promise.resolve({ data: null, error: null }),
      }),
      insert: (payload: Record<string, unknown>) => {
        store[table] = store[table] || [];
        store[table].push(payload);
        return Promise.resolve({ data: null, error: null });
      },
    }),
  };
  return client;
}

describe("integration ingestion -> property -> insights", () => {
  beforeEach(() => {
    store.properties = [];
    store.property_insights = [];
    vi.spyOn(supabaseServer, "supabaseEnabled", "get").mockReturnValue(true);
    vi.spyOn(supabaseServer, "requireAdminClient").mockReturnValue(mockAdmin() as unknown as { from: (table: string) => unknown });
    // Force enrichment to deterministic mock
    vi.spyOn(supabaseServer, "supabase").mockReturnValue(null as unknown as never);
  });

  it("persists properties and insights with updated_at and provenance", async () => {
    const profile = await buildEnrichedProfile("123 QA Lane", true);
    expect(profile.property.id).toBeDefined();
    expect(store.properties[0]?.updated_at).toBeDefined();
    expect(store.property_insights[0]?.enrichment_sources).toBeDefined();
    expect(store.property_insights[0]?.score_version).toBeDefined();
  });
});
