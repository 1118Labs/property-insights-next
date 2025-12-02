import { PropertyProfile } from "@/lib/types";

export function PropertyProvenancePanel({ profile }: { profile: PropertyProfile }) {
  const prov = profile.enrichment || profile.insights?.provenance;
  if (!prov) return null;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-sm text-slate-700 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Provenance</p>
        {prov.meta?.qualityScore !== undefined && (
          <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Quality {Math.round(prov.meta.qualityScore)}%</span>
        )}
      </div>
      <p className="mt-1 text-slate-700 dark:text-slate-200">Sources: {prov.sources?.join(", ") || "Unknown"}</p>
      {prov.meta?.providerDurations && (
        <div className="mt-2 text-xs">
          <p className="font-semibold text-slate-800 dark:text-white">Durations</p>
          <ul className="mt-1 space-y-1">
            {Object.entries(prov.meta.providerDurations).map(([k, v]) => (
              <li key={k} className="flex justify-between">
                <span className="text-slate-600 dark:text-slate-300">{k}</span>
                <span className="font-semibold text-slate-900 dark:text-white">{Math.round(v)}ms</span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {prov.meta?.fallbackUsed && <p className="mt-2 text-xs text-amber-700 dark:text-amber-200">Fallback used (cache or heuristic)</p>}
      {prov.meta?.cacheHit && <p className="mt-1 text-xs text-emerald-700 dark:text-emerald-200">Cache hit served</p>}
      {prov.meta?.circuitOpen && <p className="mt-1 text-xs text-amber-700 dark:text-amber-200">Provider circuit currently open</p>}
      {prov.errors?.length ? (
        <ul className="mt-2 list-disc pl-5 text-xs text-rose-600 dark:text-rose-300">
          {prov.errors.map((e) => (
            <li key={e}>{e}</li>
          ))}
        </ul>
      ) : null}
      {prov.meta?.providerErrors && !prov.errors?.length ? (
        <ul className="mt-2 list-disc pl-5 text-xs text-rose-600 dark:text-rose-300">
          {Object.entries(prov.meta.providerErrors).map(([k, v]) => (
            <li key={k}>{k}: {v}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
