import React from "react";

type StatProps = {
  label: string;
  value: string;
};

function Stat({ label, value }: StatProps) {
  return (
    <div className="flex flex-col">
      <span className="text-xs text-slate-500 dark:text-slate-400">
        {label}
      </span>
      <span className="font-medium text-slate-900 dark:text-white">
        {value}
      </span>
    </div>
  );
}

export default function ClientInsightCard({ property }: any) {
  const beds = property.beds != null ? String(property.beds) : "–";
  const baths = property.baths != null ? String(property.baths) : "–";
  const sqft =
    typeof property.sqft === "number"
      ? property.sqft.toLocaleString()
      : "–";
  const year =
    property.yearBuilt != null ? String(property.yearBuilt) : "–";

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="text-lg font-semibold text-slate-900 dark:text-white">
        {property.address}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-slate-700 dark:text-slate-200 sm:grid-cols-4">
        <Stat label="Beds" value={beds} />
        <Stat label="Baths" value={baths} />
        <Stat label="Sqft" value={sqft} />
        <Stat label="Year" value={year} />
      </div>
    </div>
  );
}
