import { PropertyProfile } from "@/lib/types";

export function PropertyHistoryPanel({ profile }: { profile: PropertyProfile }) {
  const history = profile.enrichment?.meta;
  const provenance = profile.insights?.provenance || profile.enrichment;
  const warnings = (provenance as { warnings?: string[] } | undefined)?.warnings || [];
  const updatedAt = profile.property.updatedAt || "n/a";
  const lastInsight = profile.insights?.lastUpdated;
  const providers = history?.providerDurations ? Object.entries(history.providerDurations) : [];

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Property history</p>
      <div className="mt-2 space-y-2 text-xs">
        <Row label="Last updated" value={updatedAt} />
        {lastInsight && <Row label="Insight refreshed" value={lastInsight} />}
        {history?.qualityScore !== undefined && <Row label="Enrichment quality" value={`${Math.round(history.qualityScore)}%`} />}
        {history?.durationMs !== undefined && <Row label="Run duration" value={`${Math.round(history.durationMs)}ms`} />}
        {history?.fallbackUsed && <Row label="Fallback" value="Used cached/heuristic values" tone="warning" />}
        {history?.cacheHit && <Row label="Cache" value="Served from warm cache" tone="success" />}
        {provenance?.errors?.length ? <Row label="Errors" value={provenance.errors.join(", ")} tone="error" /> : null}
        {warnings.length ? <Row label="Warnings" value={warnings.join(", ")} tone="warning" /> : null}
        {providers.length ? (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-400">Provider durations</p>
            <ul className="mt-1 space-y-1">
              {providers.map(([p, ms]) => (
                <li key={p} className="flex justify-between rounded bg-slate-50 px-2 py-1 text-[11px] text-slate-700 dark:bg-slate-900 dark:text-slate-100">
                  <span>{p}</span>
                  <span className="font-semibold">{Math.round(ms as number)}ms</span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function Row({ label, value, tone }: { label: string; value: string; tone?: "error" | "warning" | "success" }) {
  const toneClass =
    tone === "error"
      ? "text-rose-700 dark:text-rose-300"
      : tone === "warning"
      ? "text-amber-700 dark:text-amber-200"
      : tone === "success"
      ? "text-emerald-700 dark:text-emerald-300"
      : "text-slate-900 dark:text-white";
  return (
    <div className="flex justify-between">
      <span className="text-slate-600 dark:text-slate-300">{label}</span>
      <span className={`font-semibold ${toneClass}`}>{value}</span>
    </div>
  );
}
