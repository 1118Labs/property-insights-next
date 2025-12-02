"use client";

import { PropertyProfile } from "@/lib/types";

export function ClientInsightCard({ profile }: { profile: PropertyProfile }) {
  const insights = profile.insights;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Insights summary</p>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{profile.property.address.line1}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">{[profile.property.address.city, profile.property.address.province].filter(Boolean).join(", ")}</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
          Score {Math.round(insights.score)}
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-4">
        <Stat label="Livability" value={`${Math.round(insights.breakdown.livability)}`} />
        <Stat label="Efficiency" value={`${Math.round(insights.breakdown.efficiency)}`} />
        <Stat label="Market" value={`${Math.round(insights.breakdown.marketStrength)}`} />
        <Stat label="Risk" value={`${Math.round(insights.breakdown.risk)}`} />
      </div>
      {insights.riskFlags?.length ? (
        <div className="mt-3 space-y-1 text-xs text-amber-700 dark:text-amber-200">
          <p className="font-semibold">Risks to review:</p>
          {insights.riskFlags.slice(0, 3).map((r) => (
            <div key={r.code}>• {r.label}</div>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800">
      <p className="text-slate-500 dark:text-slate-300">{label}</p>
      <p className="font-semibold text-slate-900 dark:text-white">{value}</p>
    </div>
  );
}
