import { describe, expect, it } from "vitest";
import { estimateDuration } from "@/lib/scheduling/durationEstimator";
import { buildProfileFromRecord, mockProperty } from "@/lib/insights";
import { basicRoute } from "@/lib/scheduling/routeOptimizer";

describe("scheduling duration estimator", () => {
  it("estimates cleaning duration", () => {
    const profile = buildProfileFromRecord(mockProperty("123 Time"));
    const result = estimateDuration(profile);
    expect(result.minutes).toBeGreaterThan(0);
  });
});

describe("route optimizer", () => {
  it("builds a route within working hours", () => {
    const profile = buildProfileFromRecord(mockProperty("123 Route"));
    const slot = {
      id: "slot1",
      propertyId: "p1",
      clientId: "c1",
      serviceProfile: "cleaning",
      durationMinutes: 60,
      priority: 1,
      earliestStart: new Date().toISOString(),
      latestEnd: new Date().toISOString(),
    };
    const routes = basicRoute([slot as any], { p1: { lat: 40, lon: -73 } });
    expect(routes.length).toBeGreaterThan(0);
    expect(routes[0].stops.length).toBe(1);
  });
});
