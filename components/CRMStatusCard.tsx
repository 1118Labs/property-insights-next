"use client";

import { useEffect, useState } from "react";

type Status = { provider: string; connected: boolean };

export function CRMStatusCard() {
  const [statuses, setStatuses] = useState<Status[]>([]);

  useEffect(() => {
    fetch("/api/crm-sync/test")
      .then((r) => r.json())
      .then((b) => setStatuses(b.data || []))
      .catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-sm font-semibold text-slate-900 dark:text-white">CRM status</p>
      <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
        {statuses.map((s) => (
          <div key={s.provider} className="rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800">
            <p className="font-semibold text-slate-900 dark:text-white">{s.provider}</p>
            <p className={s.connected ? "text-emerald-700 dark:text-emerald-200" : "text-amber-700 dark:text-amber-200"}>{s.connected ? "Connected" : "Not configured"}</p>
          </div>
        ))}
        {!statuses.length && <p className="text-xs text-slate-500 dark:text-slate-300">No CRM providers configured.</p>}
      </div>
    </div>
  );
}
