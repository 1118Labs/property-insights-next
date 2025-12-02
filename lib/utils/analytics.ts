import { isAnalyticsEnabled } from "@/lib/config";

type Event = { type: string; at: number; detail?: Record<string, unknown> };

const events: Event[] = [];

export function logAnalyticsEvent(type: string, detail?: Record<string, unknown>) {
  if (!isAnalyticsEnabled) return;
  events.push({ type, at: Date.now(), detail });
  if (events.length > 200) events.shift();
}

export function getAnalyticsEvents() {
  return [...events];
}
