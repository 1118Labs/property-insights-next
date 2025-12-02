import { describe, expect, it } from "vitest";
import { POST as enrichHandler } from "@/app/api/enrich/route";
import { GET as propertiesHandler } from "@/app/api/properties/route";

vi.mock("@/lib/insights", () => ({
  fetchStoredProfiles: vi.fn().mockResolvedValue([{ property: { address: { line1: "123" } }, insights: { score: 40, breakdown: { livability: 0, efficiency: 0, marketStrength: 0, risk: 0 }, riskFlags: [], recommendations: [], summary: "", lastUpdated: "", source: "" } }]),
  summarizeProfiles: vi.fn().mockReturnValue({ total: 1, avgScore: 40, highRisk: 0 }),
  buildProfileFromRecord: vi.fn().mockImplementation((property) => ({ property, insights: { score: 40, breakdown: { livability: 0, efficiency: 0, marketStrength: 0, risk: 0 }, riskFlags: [], recommendations: [], summary: "", lastUpdated: "", source: "" } })),
}));

vi.mock("@/lib/enrichment", () => ({
  enrichProperty: vi.fn().mockResolvedValue({
    property: { address: { line1: "123" } },
    sources: ["mock"],
    errors: [],
    meta: { durationMs: 1, providerDurations: { mock: 1 } },
  }),
}));

function buildRequest(url: string, body?: Record<string, unknown>) {
  return new Request(url, {
    method: body ? "POST" : "GET",
    body: body ? JSON.stringify(body) : undefined,
    headers: body ? { "Content-Type": "application/json" } : undefined,
  });
}

describe("API normalization", () => {
  it("enrich returns normalized data", async () => {
    const res = await enrichHandler(buildRequest("http://localhost/api/enrich", { address: "123 Test" }));
    const body = await res.json();
    expect(body.data?.property).toBeTruthy();
    expect(Array.isArray(body.data?.sources)).toBe(true);
    expect(Array.isArray(body.data?.warnings)).toBe(true);
  });

  it("properties wraps items+summary under data", async () => {
    const res = await propertiesHandler(buildRequest("http://localhost/api/properties"));
    const body = await res.json();
    expect(body.data.items).toBeDefined();
    expect(body.data.summary).toBeDefined();
  });
});
