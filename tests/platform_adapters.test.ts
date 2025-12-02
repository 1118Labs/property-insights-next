import { describe, expect, it } from "vitest";
import { createServiceTitanClient, isServiceTitanConfigured } from "@/lib/platforms/adapters/serviceTitanClient";
import { createHousecallProClient, isHousecallProConfigured } from "@/lib/platforms/adapters/housecallProClient";

describe("platform adapters", () => {
  it("service titan reports configuration state", async () => {
    const client = createServiceTitanClient();
    const health = await client.healthCheck!();
    expect(isServiceTitanConfigured()).toBe(false);
    expect(health.status === "error" || health.status === "ok").toBe(true);
  });

  it("housecall pro reports configuration state", async () => {
    const client = createHousecallProClient();
    const health = await client.healthCheck!();
    expect(isHousecallProConfigured()).toBe(false);
    expect(health.status === "error" || health.status === "ok").toBe(true);
  });
});
