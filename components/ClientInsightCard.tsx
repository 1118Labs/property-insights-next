"use client";

import { PropertyProfile } from "@/lib/types";

export function ClientInsightCard({ profile }: { profile: PropertyProfile }) {
  const insights = profile.insights;
  const property = profile.property;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Property summary</p>
      <div className="mt-2 flex items-center justify-between">
        <div>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{property.address.line1}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">{[property.address.city, property.address.province].filter(Boolean).join(", ")}</p>
        </div>
        <div className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-semibold text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">
          Enriched
        </div>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-4">
        <Stat label="Beds" value={property.beds ?? "–"} />
        <Stat label="Baths" value={property.baths ?? "–"} />
        <Stat label="Sqft" value={property.sqft?.toLocaleString() ?? "–"} />
        <Stat label="Year" value={property.yearBuilt ?? "–"} />
      </div>
      <div className="mt-3 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200">
        <p className="text-slate-500 dark:text-slate-300">Estimated value</p>
        <p className="font-semibold text-slate-900 dark:text-white">
          {insights.valuation?.estimate ? `$${insights.valuation.estimate.toLocaleString()}` : "Pending"}
        </p>
        {insights.summary && <p className="mt-1 text-slate-600 dark:text-slate-300">{insights.summary}</p>}
      </div>
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
