"use client";
import { useState } from "react";
import { logAnalyticsEvent } from "@/lib/utils/analytics";

type Props = {
  open: boolean;
  onClose: () => void;
  disabledReason?: string | null;
};

export function ManualIngestModal({ open, onClose, disabledReason }: Props) {
  const [dryRun, setDryRun] = useState(true);
  const [limit, setLimit] = useState(10);
  const [result, setResult] = useState<unknown>(null);
  const [loading, setLoading] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  if (!open) return null;

  const run = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/cron/run", {
        method: "POST",
        body: JSON.stringify({ task: "jobber-ingest", dryRun, limit }),
      });
      const body = await res.json();
      setResult(body);
      logAnalyticsEvent("ingest_run", { dryRun, limit });
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Run Manual Ingest</h3>
          <button onClick={onClose} className="text-sm text-slate-600 hover:underline dark:text-slate-200">Close</button>
        </div>
        <div className="mt-3 space-y-2 text-sm">
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={dryRun} onChange={(e) => setDryRun(e.target.checked)} />
            Dry run (no writes)
          </label>
          <label className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} aria-label="Confirm ingest action" />
            I understand this will call Jobber and upsert data.
          </label>
          <label className="text-slate-700 dark:text-slate-200">
            Limit
            <input
              type="number"
              min={1}
              max={50}
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="mt-1 w-24 rounded border border-slate-200 px-2 py-1 text-sm dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
            />
          </label>
        </div>
        <div className="mt-4 flex items-center justify-between">
          <button onClick={run} disabled={loading || !!disabledReason || !confirmed} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900">
            {loading ? "Running..." : "Run task"}
          </button>
          <span className="text-xs text-slate-500 dark:text-slate-300">{disabledReason || "Uses /api/cron/run (safe)"}</span>
        </div>
        {result && (
          <pre className="mt-3 max-h-48 overflow-auto rounded bg-slate-50 p-2 text-xs text-slate-700 dark:bg-slate-900 dark:text-slate-100">
            {JSON.stringify(result, null, 2)}
          </pre>
        )}
      </div>
    </div>
  );
}
