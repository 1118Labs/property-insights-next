"use client";

import { ServiceProfileType } from "@/lib/types";

type Props = { value?: ServiceProfileType; onChange?: (v: ServiceProfileType) => void; label?: string };

const OPTIONS: ServiceProfileType[] = [
  "cleaning",
  "lawncare",
  "roofing",
  "painting",
  "pressure_washing",
  "window_washing",
  "gutter_cleaning",
  "snow_removal",
  "pool_service",
];

export function ServiceProfileSelector({ value, onChange, label }: Props) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">{label || "Service profile"}</p>
      <select
        value={value || ""}
        onChange={(e) => onChange?.(e.target.value as ServiceProfileType)}
        className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
      >
        <option value="">Select a service</option>
        {OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {opt.replace("_", " ")}
          </option>
        ))}
      </select>
    </div>
  );
}
