import { describe, expect, it, afterEach } from "vitest";
import { POST as ingestHandler } from "@/app/api/jobber/ingest/route";

// Mock supabaseEnabled to true and inject ensureJobberAccessToken + fetchRecentJobberRequests + ingestJobberRequests via vitest mocks.
vi.mock("@/lib/supabase/server", () => ({ supabaseEnabled: true }));
vi.mock("@/lib/jobber", async (orig) => {
  const actual = await orig();
  return {
    ...actual,
    ensureJobberAccessToken: vi.fn().mockResolvedValue({ accessToken: "token", tokenStatus: "fresh" }),
    fetchRecentJobberRequests: vi.fn().mockResolvedValue([{ node: { id: "1" } }]),
    ingestJobberRequests: vi.fn().mockResolvedValue({ ingested: 1, skipped: 0, errors: [] }),
  };
});

function buildRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/jobber/ingest", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/jobber/ingest", () => {
  afterEach(() => {
    delete process.env.ADMIN_SHARED_SECRET;
  });

  it("supports dry-run mode", async () => {
    const res = await ingestHandler(buildRequest({ dryRun: true }));
    const body = await res.json();
    expect(res.status).toBe(200);
    expect(body.mode).toBe("dry-run");
    expect(body.result?.ingested).toBe(0);
  });

  it("requires admin secret when configured", async () => {
    process.env.ADMIN_SHARED_SECRET = "secret123";
    const res = await ingestHandler(buildRequest({ dryRun: true }));
    expect(res.status).toBe(401);
  });
});
