"use client";

import { useEffect, useState } from "react";
import { ProviderDiagnosticsDashboard } from "@/components/ProviderDiagnosticsDashboard";
import { CircuitBreakerIndicator } from "@/components/CircuitBreakerIndicator";

type Provider = { label: string; circuitOpen?: boolean; circuitOpenUntil?: number | null };

export default function ProviderDiagnosticsPage() {
  const [providers, setProviders] = useState<Provider[]>([]);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((body) => setProviders(body.providers || []))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <p className="font-semibold text-slate-900 dark:text-white">Known caveats</p>
        <p className="text-xs text-slate-600 dark:text-slate-300">Provider metrics are in-memory and reset on restart. Circuit breakers auto-close after cooldown. See <a className="underline" href="/docs/known-limitations">Known Limitations</a>.</p>
      </div>
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Circuit indicators</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {providers.length
            ? providers.map((p) => (
                <CircuitBreakerIndicator key={p.label} provider={p.label} open={Boolean(p.circuitOpen)} until={p.circuitOpenUntil || undefined} />
              ))
            : <p className="text-xs text-slate-500 dark:text-slate-300">No providers configured yet.</p>}
        </div>
      </div>

      <ProviderDiagnosticsDashboard autoRefreshMs={8000} />
    </div>
  );
}
