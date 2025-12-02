import { describe, expect, it } from "vitest";
import { GET as statusHandler } from "@/app/api/status/route";
import { GET as healthHandler } from "@/app/api/health/route";
import { GET as providerHealthHandler } from "@/app/api/provider-health/route";
import { GET as platformHealthHandler } from "@/app/api/platform-health/route";
import { POST as enrichHandler } from "@/app/api/enrich/route";
import { POST as insightsHandler } from "@/app/api/property-insights/route";
import { POST as cronHandler } from "@/app/api/cron/run/route";

function post(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
}

describe("API smoke tests", () => {
  it("status responds", async () => {
    const res = await statusHandler();
    expect(res.status).toBeLessThan(500);
  });

  it("health responds", async () => {
    const res = await healthHandler();
    expect(res.status).toBeLessThan(500);
  });

  it("provider health responds", async () => {
    const res = await providerHealthHandler();
    expect(res.status).toBeLessThan(500);
  });

  it("platform health responds", async () => {
    const res = await platformHealthHandler();
    expect(res.status).toBeLessThan(500);
  });

  it("enrich responds", async () => {
    const res = await enrichHandler(post("/api/enrich", { address: "123 Smoke St" }));
    expect(res.status).toBeLessThan(500);
  });

  it("property insights responds", async () => {
    const res = await insightsHandler(post("/api/property-insights", { address: "123 Smoke St" }));
    expect(res.status).toBeLessThan(500);
  });

  it("cron run dry-run responds", async () => {
    const res = await cronHandler(post("/api/cron/run", { task: "jobber-ingest", dryRun: true }));
    expect(res.status).toBeLessThan(500);
  });
});
