import { describe, expect, it, vi } from "vitest";
import { GET as ingestionEventsHandler } from "@/app/api/ingestion-events/route";

describe("/api/ingestion-events filters", () => {
  it("applies filters and returns count", async () => {
    vi.mock("@/lib/supabase/server", () => ({
      supabaseEnabled: false,
      requireAdminClient: () => ({}),
    }));
    const url = new URL("http://localhost/api/ingestion-events?source=enrichment&status=partial&since=2024-01-01&q=test&limit=5&offset=0");
    const res = await ingestionEventsHandler(new Request(url.toString()));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.data).toEqual([]);
  });
});
