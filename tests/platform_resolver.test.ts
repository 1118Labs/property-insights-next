import { describe, expect, it, vi } from "vitest";
import { resolvePlatform, listPlatforms } from "@/lib/platforms/resolver";

vi.mock("@/lib/platforms/adapters/jobberClient", () => ({
  createJobberClient: vi.fn(() => ({ slug: "jobber", name: "Jobber", listClients: async () => [], listJobs: async () => [] })),
}));
vi.mock("@/lib/platforms/adapters/serviceTitanClient", () => ({
  createServiceTitanClient: vi.fn(() => ({ slug: "servicetitan", name: "ServiceTitan", listClients: async () => [], listJobs: async () => [] })),
  isServiceTitanConfigured: () => false,
}));
vi.mock("@/lib/platforms/adapters/housecallProClient", () => ({
  createHousecallProClient: vi.fn(() => ({ slug: "housecall_pro", name: "Housecall Pro", listClients: async () => [], listJobs: async () => [] })),
  isHousecallProConfigured: () => false,
}));

describe("platform resolver", () => {
  it("defaults to jobber client", () => {
    const client = resolvePlatform();
    expect(client.slug).toBe("jobber");
  });

  it("lists platforms with configured flag", () => {
    const platforms = listPlatforms();
    expect(Array.isArray(platforms)).toBe(true);
    expect(platforms.find((p) => p.slug === "jobber")).toBeTruthy();
  });
});
