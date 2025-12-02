"use client";
import { useEffect, useState } from "react";

type ProviderRow = {
  label: string;
  configured: boolean;
  circuitOpen?: boolean;
  circuitOpenUntil?: number | null;
  uptime?: number;
  errorRate?: number;
  avgMs?: number;
  lastError?: string;
};

export function ProviderDiagnosticsDashboard({ autoRefreshMs = 10000 }: { autoRefreshMs?: number }) {
  const [providers, setProviders] = useState<ProviderRow[]>([]);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/health");
      const body = await res.json();
      setProviders(body.providers || []);
    } catch {
      setProviders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    if (autoRefreshMs > 0) {
      const id = setInterval(load, autoRefreshMs);
      return () => clearInterval(id);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Provider diagnostics</p>
        <button onClick={load} className="text-xs font-semibold text-slate-700 underline-offset-2 hover:underline dark:text-slate-100">
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {providers.map((p) => (
          <div key={p.label} className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-slate-900 dark:text-white">{p.label}</span>
              <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${p.configured ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200" : "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200"}`}>
                {p.configured ? "enabled" : "disabled"}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between">
              <span>Uptime</span>
              <span className="font-semibold">{p.uptime !== undefined ? Math.round((p.uptime ?? 0) * 100) + "%" : "n/a"}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>Avg latency</span>
              <span className="font-semibold">{p.avgMs ? `${Math.round(p.avgMs)}ms` : "n/a"}</span>
            </div>
            <div className="mt-1 flex items-center justify-between">
              <span>Error rate</span>
              <span className="font-semibold">{p.errorRate !== undefined ? Math.round((p.errorRate ?? 0) * 100) + "%" : "n/a"}</span>
            </div>
            {p.circuitOpen && (
              <div className="mt-2 rounded bg-amber-100 px-2 py-1 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">
                Circuit open {p.circuitOpenUntil ? `until ${new Date(p.circuitOpenUntil).toLocaleTimeString()}` : ""}
              </div>
            )}
            {p.lastError && <p className="mt-1 text-[11px] text-rose-700 dark:text-rose-300">Last error: {p.lastError}</p>}
          </div>
        ))}
        {!providers.length && !loading && <p className="text-xs text-slate-500 dark:text-slate-300">No provider data yet.</p>}
      </div>
    </div>
  );
}
