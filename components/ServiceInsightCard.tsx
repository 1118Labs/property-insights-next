"use client";

import { ServiceProfileType } from "@/lib/types";

type Props = { profile: ServiceProfileType; details?: Record<string, unknown>; warnings?: string[]; confidence?: number };

export function ServiceInsightCard({ profile, details, warnings = [], confidence }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-white capitalize">{profile.replace("_", " ")}</p>
        <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">
          {confidence ? `Confidence ${confidence}%` : "Preview"}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-1 gap-1 text-xs text-slate-700 dark:text-slate-200">
        {details
          ? Object.entries(details).map(([k, v]) => (
              <div key={k} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-2 py-1 dark:border-slate-700 dark:bg-slate-800">
                <span className="text-slate-500">{k}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{String(v)}</span>
              </div>
            ))
          : <p className="text-xs text-slate-500">No details available.</p>}
      </div>
      {warnings.length ? (
        <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-200">
          Warnings: {warnings.join(", ")}
        </div>
      ) : null}
    </div>
  );
}
