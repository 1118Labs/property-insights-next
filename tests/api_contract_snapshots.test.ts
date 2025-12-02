import { describe, expect, it } from "vitest";
import { GET as statusHandler } from "@/app/api/status/route";
import { GET as healthHandler } from "@/app/api/health/route";

describe("API contract snapshots", () => {
  it("status contract shape", async () => {
    const res = await statusHandler();
    const body = await res.json();
    expect(body).toEqual(
      expect.objectContaining({
        supabase: expect.any(Object),
        jobber: expect.any(Object),
        external: expect.any(Object),
      })
    );
  });

  it("health contract shape", async () => {
    const res = await healthHandler();
    const body = await res.json();
    expect(body).toEqual(expect.objectContaining({ status: expect.any(String) }));
  });
});
