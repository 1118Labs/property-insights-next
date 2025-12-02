"use client";

import { useEffect, useState } from "react";

type RecordItem = { id: string; channel: string; to: string; template: string; status: string; createdAt: string; error?: string };

export function NotificationLog() {
  const [items, setItems] = useState<RecordItem[]>([]);

  useEffect(() => {
    fetch("/api/schedule/metrics")
      .catch(() => {});
    // placeholder: would fetch notification store when backed by API
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">Notification log</p>
      {items.length === 0 ? <p className="text-xs text-slate-500 dark:text-slate-300">No notifications sent in this session.</p> : null}
    </div>
  );
}
