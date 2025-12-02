import { describe, expect, it } from "vitest";
import { GET as propertiesCsv } from "@/app/api/export/properties.csv/route";
import { GET as insightsCsv } from "@/app/api/export/insights.csv/route";

describe("export csv endpoints", () => {
  it("returns properties csv", async () => {
    const res = await propertiesCsv();
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(res.headers.get("Content-Type")).toContain("text/csv");
    expect(text).toContain("line1");
  });

  it("returns insights csv", async () => {
    const res = await insightsCsv();
    expect(res.status).toBe(200);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(0);
  });
});
