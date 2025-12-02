import { describe, expect, it } from "vitest";
import { POST as inviteHandler } from "@/app/api/portal/invite/route";
import { GET as verifyHandler } from "@/app/api/portal/verify/route";
import { POST as approveHandler } from "@/app/api/portal/approve/route";

function post(path: string, body: unknown) {
  return new Request(`http://localhost${path}`, { method: "POST", body: JSON.stringify(body), headers: { "Content-Type": "application/json" } });
}

function get(path: string) {
  return new Request(`http://localhost${path}`, { method: "GET" });
}

describe("portal flows", () => {
  it("creates invite and verifies token", async () => {
    const inviteRes = await inviteHandler(post("/api/portal/invite", { clientId: "c1", propertyId: "p1", quoteId: "q1" }));
    expect(inviteRes.status).toBeLessThan(500);
    const inviteBody = await inviteRes.json();
    const token = inviteBody.data.token;
    const verifyRes = await verifyHandler(get(`http://localhost/api/portal/verify?token=${token}`));
    expect(verifyRes.status).toBeLessThan(500);
  });

  it("approves token", async () => {
    const inviteRes = await inviteHandler(post("/api/portal/invite", { clientId: "c2", propertyId: "p2" }));
    const inviteBody = await inviteRes.json();
    const token = inviteBody.data.token;
    const approveRes = await approveHandler(post("/api/portal/approve", { token }));
    expect(approveRes.status).toBeLessThan(500);
    const approveBody = await approveRes.json();
    expect(approveBody.data.status).toBe("approved");
  });
});
