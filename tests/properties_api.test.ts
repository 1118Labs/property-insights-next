import { describe, expect, it } from "vitest";
import { GET as listProperties } from "@/app/api/properties/route";
import { GET as getProperty } from "@/app/api/properties/[id]/route";

vi.mock("@/lib/insights", () => {
  const mockProfile = { property: { address: { line1: "123" } }, insights: { score: 50, breakdown: { livability: 0, efficiency: 0, marketStrength: 0, risk: 0 }, riskFlags: [], recommendations: [], summary: "", lastUpdated: "", source: "" } };
  return {
    fetchStoredProfiles: vi.fn().mockResolvedValue([mockProfile]),
    summarizeProfiles: vi.fn().mockReturnValue({ total: 1, avgScore: 50, highRisk: 0 }),
    fetchProfileById: vi.fn().mockImplementation(async (id: string) => (id === "exists" ? mockProfile : null)),
  };
});

function buildRequest(url: string) {
  return new Request(url, { method: "GET" });
}

describe("properties API", () => {
  it("lists properties", async () => {
    const res = await listProperties(buildRequest("http://localhost/api/properties"));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.data).toBeTruthy();
  });

  it("returns 404 when property missing", async () => {
    const res = await getProperty(buildRequest("http://localhost/api/properties/none"), { params: Promise.resolve({ id: "none" }) });
    expect(res.status).toBe(404);
  });
});
