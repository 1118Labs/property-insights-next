import { describe, expect, it } from "vitest";
import { GET as healthHandler } from "@/app/api/health/route";
import { POST as propertyInsightsHandler } from "@/app/api/property-insights/route";
import { POST as cronRunHandler } from "@/app/api/cron/run/route";

function buildRequest(path: string, body?: unknown) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    body: body ? JSON.stringify(body) : undefined,
    headers: { "Content-Type": "application/json" },
  });
}

describe("release smoke", () => {
  it("returns health payload", async () => {
    const res = await healthHandler();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.status).toBeDefined();
    expect(res.headers.get("x-correlation-id")).toBeTruthy();
  });

  it("handles property insight request", async () => {
    const res = await propertyInsightsHandler(buildRequest("/api/property-insights", { address: "123 Test Ave" }));
    expect(res.status).toBeLessThan(500);
    const body = await res.json();
    expect(body.correlationId).toBeTruthy();
  });

  it("supports cron run dry-run", async () => {
    const res = await cronRunHandler(buildRequest("/api/cron/run", { task: "jobber-ingest", dryRun: true }));
    expect(res.status).toBeLessThan(500);
  });
});
