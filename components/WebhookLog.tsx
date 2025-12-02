"use client";

export function WebhookLog() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Webhook log</p>
      <p className="text-xs text-slate-500 dark:text-slate-300">Webhook events are logged server-side (in-memory) for this session.</p>
    </div>
  );
}
