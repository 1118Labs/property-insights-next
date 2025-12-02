"use client";

import { JobSlot } from "@/lib/scheduling/types";

export function JobSlotList({ slots }: { slots: JobSlot[] }) {
  if (!slots.length) return <p className="text-xs text-slate-500 dark:text-slate-300">No pending job slots.</p>;
  return (
    <div className="space-y-2">
      {slots.map((slot) => (
        <div key={slot.id} className="rounded-lg border border-slate-200 bg-white p-3 text-sm shadow-sm dark:border-slate-700 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="font-semibold text-slate-900 dark:text-white">{slot.serviceProfile}</p>
            <span className="text-xs text-slate-500 dark:text-slate-300">{slot.durationMinutes} min</span>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-300">Earliest: {slot.earliestStart}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">Latest: {slot.latestEnd}</p>
          {slot.quoteId && <p className="text-xs text-emerald-700 dark:text-emerald-200">Quote: {slot.quoteId}</p>}
        </div>
      ))}
    </div>
  );
}
