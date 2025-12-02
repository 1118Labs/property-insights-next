import { describe, expect, it } from "vitest";
import { POST as enrichHandler } from "@/app/api/enrich/route";

function buildRequest(body: Record<string, unknown>) {
  return new Request("http://localhost/api/enrich", {
    method: "POST",
    body: JSON.stringify(body),
    headers: { "Content-Type": "application/json" },
  });
}

describe("/api/enrich", () => {
  it("rejects missing address", async () => {
    const res = await enrichHandler(buildRequest({}));
    expect(res.status).toBe(400);
  });

  it("returns data for valid address", async () => {
    const res = await enrichHandler(buildRequest({ address: "123 Test" }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body?.data?.property).toBeTruthy();
  });
});
