"use client";

import { DailyRoute } from "@/lib/scheduling/types";

export function DailyRouteView({ route }: { route: DailyRoute }) {
  if (!route) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Route</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{route.date}</p>
        </div>
        <div className="text-right text-xs text-slate-500 dark:text-slate-300">
          <p>Drive: {route.totalDriveMinutes}m</p>
          <p>Work: {route.totalWorkMinutes}m</p>
        </div>
      </div>
      <div className="mt-3 space-y-2 text-sm">
        {route.stops.map((s, idx) => (
          <div key={s.jobSlotId} className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-800">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-slate-900 dark:text-white">Stop {idx + 1}</p>
              <span className="text-xs text-slate-500 dark:text-slate-300">{s.travelMinutes}m drive</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300">
              {new Date(s.arrivalTime).toLocaleTimeString()} - {new Date(s.departureTime).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
