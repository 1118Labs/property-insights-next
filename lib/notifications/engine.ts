import { randomUUID } from "crypto";
import { logNotification } from "@/lib/notifications/store";

type DispatchContext = {
  webhookUrls?: string[];
  fromEmail?: string;
  smsFrom?: string;
};

const configState: DispatchContext = {
  webhookUrls: [],
  fromEmail: process.env.NOTIFY_FROM_EMAIL || undefined,
  smsFrom: process.env.NOTIFY_SMS_FROM || undefined,
};

const DISABLED = process.env.NOTIFICATIONS_DISABLED === "true";
const rateLimit = Number(process.env.NOTIFY_RATE_LIMIT || 60);
let dispatched = 0;
let windowStart = Date.now();

export function getNotificationConfig() {
  return { ...configState, disabled: DISABLED };
}

export function updateNotificationConfig(input: Partial<DispatchContext>) {
  Object.assign(configState, input);
  return getNotificationConfig();
}

async function sendWebhook(url: string, payload: unknown) {
  const start = Date.now();
  try {
    const res = await fetch(url, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    const ok = res.ok;
    logNotification({ id: randomUUID(), channel: "webhook", to: url, template: "webhook", status: ok ? "sent" : "failed", createdAt: new Date().toISOString(), error: ok ? undefined : res.statusText, durationMs: Date.now() - start });
  } catch (err) {
    logNotification({ id: randomUUID(), channel: "webhook", to: url, template: "webhook", status: "failed", createdAt: new Date().toISOString(), error: String(err), durationMs: Date.now() - start });
  }
}

export async function dispatchNotification(channel: "email" | "sms" | "webhook", to: string, template: string, payload: Record<string, unknown>) {
  if (DISABLED) return { status: "disabled" };
  const now = Date.now();
  if (now - windowStart > 60_000) {
    dispatched = 0;
    windowStart = now;
  }
  if (dispatched >= rateLimit) {
    return { status: "rate_limited" };
  }
  dispatched += 1;
  const start = Date.now();
  try {
    if (channel === "webhook") {
      await sendWebhook(to, payload);
      return { status: "ok" };
    }
    logNotification({ id: randomUUID(), channel, to, template, status: "sent", createdAt: new Date().toISOString(), durationMs: Date.now() - start });
    return { status: "ok" };
  } catch (err) {
    logNotification({ id: randomUUID(), channel, to, template, status: "failed", error: String(err), createdAt: new Date().toISOString(), durationMs: Date.now() - start });
    return { status: "failed", error: String(err) };
  }
}

export async function triggerEvent(event: "quote_created" | "quote_approved" | "insights_ready" | "job_scheduled" | "job_completed", payload: Record<string, unknown>) {
  const urls = configState.webhookUrls || [];
  await Promise.all(urls.map((u) => sendWebhook(u, { event, payload })));
}
