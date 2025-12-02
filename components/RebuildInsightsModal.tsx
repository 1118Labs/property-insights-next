"use client";
import { useEffect, useState } from "react";
import { logAnalyticsEvent } from "@/lib/utils/analytics";

type Props = { open: boolean; onClose: () => void; addresses?: string[]; disabledReason?: string | null };

export function RebuildInsightsModal({ open, onClose, addresses = ["123 Harbor Ln", "456 Maple Ave", "789 Ocean Blvd"], disabledReason }: Props) {
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (!open) {
      setRunning(false);
      setProgress(0);
      setLogs([]);
    }
  }, [open]);

  if (!open) return null;

  const run = async () => {
    setRunning(true);
    setLogs([]);
    for (let i = 0; i < addresses.length; i++) {
      const address = addresses[i];
      try {
        const res = await fetch("/api/property-insights", {
          method: "POST",
          body: JSON.stringify({ address, persist: true, enrich: true }),
        });
        const body = await res.json();
        setLogs((prev) => [...prev, `${address}: ${res.ok ? "ok" : "error"}`]);
        if (!res.ok) {
          setLogs((prev) => [...prev, `  ${body.error || "unknown error"}`]);
        }
      } catch (err) {
        setLogs((prev) => [...prev, `${address}: ${String(err)}`]);
      } finally {
        setProgress(Math.round(((i + 1) / addresses.length) * 100));
      }
    }
    logAnalyticsEvent("rebuild_insights_run", { count: addresses.length });
    setRunning(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Rebuild Insights</h3>
          <button onClick={onClose} className="text-sm text-slate-600 hover:underline dark:text-slate-200">Close</button>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-200">
          Runs enrichment + scoring for a handful of addresses. Safe, manual trigger only.
        </p>
        <label className="mt-3 flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300">
          <input aria-label="Confirm rebuild insights" type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          Confirm rebuild (may take a moment)
        </label>
        <div className="mt-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
          Addresses: {addresses.join(", ")}
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-100 dark:bg-slate-700">
          <div className="h-2 rounded-full bg-emerald-500 transition-all" style={{ width: `${progress}%` }} />
        </div>
        <div className="mt-3 flex items-center justify-between">
          <button onClick={run} disabled={running || !!disabledReason || !confirmed} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow disabled:opacity-50 dark:bg-emerald-500">
            {running ? "Running…" : "Start rebuild"}
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-300">{disabledReason || `${progress}%`}</span>
        </div>
        <pre className="mt-3 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-100">
          {logs.length ? logs.join("\n") : "No runs yet."}
        </pre>
      </div>
    </div>
  );
}
