type NotificationRecord = {
  id: string;
  channel: "email" | "sms" | "webhook";
  to: string;
  template: string;
  status: "sent" | "failed";
  error?: string;
  createdAt: string;
  durationMs?: number;
};

const notifications: NotificationRecord[] = [];

export function logNotification(record: NotificationRecord) {
  notifications.push(record);
}

export function listNotifications() {
  return notifications;
}

export function deliveryMetrics() {
  const total = notifications.length || 1;
  const successes = notifications.filter((n) => n.status === "sent").length;
  const avg = notifications.reduce((acc, n) => acc + (n.durationMs || 0), 0) / (notifications.length || 1);
  return { successRate: successes / total, avgSendTime: Math.round(avg) };
}
