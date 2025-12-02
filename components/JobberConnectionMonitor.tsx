"use client";
import { useMemo } from "react";

type Props = {
  tokenStatus?: string;
  expiresAt?: number | string | null;
  lastRefresh?: string | null;
  failureCount?: number;
};

export function JobberConnectionMonitor({ tokenStatus = "unknown", expiresAt, lastRefresh, failureCount = 0 }: Props) {
  const expiryLabel = useMemo(() => {
    if (!expiresAt) return "n/a";
    if (typeof expiresAt === "number") return `epoch ${expiresAt}`;
    return expiresAt;
  }, [expiresAt]);

  const tone =
    tokenStatus === "fresh"
      ? "bg-emerald-50 text-emerald-900 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-700 dark:text-emerald-100"
      : tokenStatus === "refreshed"
      ? "bg-sky-50 text-sky-900 border-sky-200 dark:bg-sky-900/30 dark:border-sky-700 dark:text-sky-100"
      : "bg-amber-50 text-amber-900 border-amber-200 dark:bg-amber-900/30 dark:border-amber-700 dark:text-amber-100";

  return (
    <div className={`rounded-xl border px-4 py-3 text-sm shadow-sm ${tone}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide">Jobber token</p>
          <p className="text-base font-semibold">{tokenStatus}</p>
        </div>
        <div className="text-right text-xs">
          <p className="font-semibold">Expires</p>
          <p>{expiryLabel}</p>
          {lastRefresh && <p className="text-[11px] text-amber-700 dark:text-amber-200">Last refresh: {new Date(lastRefresh).toLocaleString()}</p>}
        </div>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="rounded-full bg-white/60 px-2 py-1 font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">
          Failures: {failureCount}
        </span>
        {tokenStatus.includes("stale") && <span className="rounded-full bg-rose-100 px-2 py-1 font-semibold text-rose-700 dark:bg-rose-900/50 dark:text-rose-200">Refresh recommended</span>}
      </div>
    </div>
  );
}
