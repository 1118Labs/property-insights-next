import { describe, expect, it, vi } from "vitest";
import { ingestFromPlatform } from "@/lib/ingestion/platformIngestion";
import { FSPlatformClient } from "@/lib/platforms/client";

const stubClient: FSPlatformClient = {
  slug: "jobber",
  name: "Stub",
  async listClients() {
    return [
      {
        id: "c1",
        firstName: "Test",
        lastName: "User",
        properties: [
          { id: "p1", address: { line1: "123 Test", city: "City" } },
        ],
      },
    ];
  },
  async listJobs() {
    return [{ id: "j1", title: "Job", status: "open", clientId: "c1", propertyId: "p1" }];
  },
};

vi.mock("@/lib/platforms/resolver", () => ({
  resolvePlatform: vi.fn(() => stubClient),
  listPlatforms: vi.fn(() => []),
}));

describe("platform ingestion", () => {
  it("returns normalized data for stubbed platform", async () => {
    const result = await ingestFromPlatform({ dryRun: true, limit: 5 });
    expect(result.platform).toBe("jobber");
    expect(result.clients.length).toBeGreaterThan(0);
    expect(result.properties.length).toBeGreaterThan(0);
    expect(result.jobs.length).toBeGreaterThan(0);
  });
});
