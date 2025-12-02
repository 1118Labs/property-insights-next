import { describe, expect, it, vi } from "vitest";
import { ingestFromPlatform } from "@/lib/ingestion/platformIngestion";

const resolvePlatformMock = vi.fn();

vi.mock("@/lib/platforms/resolver", () => ({
  resolvePlatform: (...args: unknown[]) => resolvePlatformMock(...args),
  listPlatforms: vi.fn(() => []),
}));

type TestSlug = "jobber" | "servicetitan" | "housecall_pro";

resolvePlatformMock.mockImplementation((slug?: string) => {
  const selected: TestSlug = (slug as TestSlug) || "jobber";
  return {
  slug: selected,
  name: "stub",
  listClients: async () => [
    { id: `${selected}-c1`, properties: [{ id: `${selected}-p1`, address: { line1: "123 St" } }] },
  ],
  listJobs: async () => [],
};
});

describe("multi-platform ingestion", () => {
  it("ingests jobber stub", async () => {
    const result = await ingestFromPlatform({ platform: "jobber", dryRun: true });
    expect(result.platform).toBe("jobber");
    expect(result.properties.length).toBeGreaterThan(0);
  });

  it("ingests servicetitan stub", async () => {
    const result = await ingestFromPlatform({ platform: "servicetitan", dryRun: true });
    expect(result.platform).toBe("servicetitan");
  });

  it("ingests housecall pro stub", async () => {
    const result = await ingestFromPlatform({ platform: "housecall_pro", dryRun: true });
    expect(result.platform).toBe("housecall_pro");
  });
});
