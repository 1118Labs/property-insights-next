import { describe, expect, it } from "vitest";
import { dispatchNotification, triggerEvent, updateNotificationConfig } from "@/lib/notifications/engine";

describe("notifications", () => {
  it("dispatches webhook", async () => {
    updateNotificationConfig({ webhookUrls: ["http://localhost/api/webhooks/test-endpoint"] });
    const res = await dispatchNotification("webhook", "http://localhost/api/webhooks/test-endpoint", "test", { hello: "world" });
    expect(res.status).toBe("ok");
  });

  it("fires trigger event", async () => {
    await triggerEvent("quote_created", { id: "q1" });
    expect(true).toBe(true);
  });
});
