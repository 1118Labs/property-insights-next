import { describe, expect, it } from "vitest";
import { POST as buildQuoteHandler } from "@/app/api/quote/build/route";
import { GET as exportHandler } from "@/app/api/quote/[id]/export/route";
import { GET as quoteGetHandler } from "@/app/api/quote/[id]/route";
import { saveQuote } from "@/lib/quotes/store";
import { buildProfileFromRecord, mockProperty } from "@/lib/insights";
import { buildQuote } from "@/lib/quotes/builder";

function post(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
}

function get(path: string) {
  return new Request(`http://localhost${path}`, { method: "GET" });
}

describe("quote APIs", () => {
  it("/api/quote/build responds", async () => {
    const res = await buildQuoteHandler(post("/api/quote/build", { address: "123 API Quote", serviceProfile: "cleaning" }));
    expect(res.status).toBeLessThan(500);
    const body = await res.json();
    expect(body.data?.total).toBeGreaterThan(0);
  });

  it("quote export returns html", async () => {
    const profile = buildProfileFromRecord(mockProperty("123 Export"));
    const saved = saveQuote(buildQuote(profile, "cleaning"));
    const res = await exportHandler(get(`http://localhost/api/quote/${saved.id}/export`), { params: Promise.resolve({ id: saved.id }) });
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text).toContain("Service Quote");
  });

  it("quote get returns latest version", async () => {
    const profile = buildProfileFromRecord(mockProperty("123 Get"));
    const saved = saveQuote(buildQuote(profile, "cleaning"));
    const res = await quoteGetHandler(get(`http://localhost/api/quote/${saved.id}`), { params: Promise.resolve({ id: saved.id }) });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data.id).toBe(saved.id);
  });
});
