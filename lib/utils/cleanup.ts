import { listNotifications } from "@/lib/notifications/store";
import { listInvites } from "@/lib/portal/store";
import { getQuote } from "@/lib/quotes/store";

export function cleanupExpired() {
  const now = Date.now();
  // notifications cleanup (in-memory: drop older than 7 days)
  const sevenDays = 7 * 24 * 60 * 60 * 1000;
  const notif = listNotifications().filter((n) => now - new Date(n.createdAt).getTime() < sevenDays);
  // portal invites auto-prune via getters; just touch
  listInvites();
  // quotes store left as-is (in-memory)
  return { notificationsPruned: notif.length };
}
