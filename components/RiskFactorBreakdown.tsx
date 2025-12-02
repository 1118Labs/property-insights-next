import { RiskFlag, ScoreBreakdown } from "@/lib/types";

type Props = {
  breakdown: ScoreBreakdown;
  flags?: RiskFlag[];
};

export function RiskFactorBreakdown({ breakdown, flags = [] }: Props) {
  const entries = [
    { label: "Livability", value: breakdown.livability },
    { label: "Efficiency", value: breakdown.efficiency },
    { label: "Market Strength", value: breakdown.marketStrength },
    { label: "Lot Appeal", value: breakdown.lotAppeal },
    { label: "Age Factor", value: breakdown.ageFactor },
    { label: "Equity Delta", value: breakdown.equityDelta },
    { label: "Price to Rent", value: breakdown.priceToRent },
    { label: "Cashflow Risk", value: breakdown.cashflowRisk },
  ].filter((e) => e.value !== undefined && e.value !== null);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">Risk factors</p>
        <span className="text-[11px] font-semibold uppercase text-slate-600 dark:text-slate-300">{flags.length} flags</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {entries.map((entry) => (
          <div key={entry.label} className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-800 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
            <span>{entry.label}</span>
            <span className="font-semibold text-slate-900 dark:text-white">
              {typeof entry.value === "number" ? Math.round(entry.value) : entry.value}
              {typeof entry.value === "number" ? "/100" : ""}
            </span>
          </div>
        ))}
      </div>
      {flags.length ? (
        <div className="mt-3 flex flex-wrap gap-2 text-[11px]">
          {flags.map((flag) => (
            <span key={flag.code} className="rounded-full px-2 py-1 font-semibold"
              style={{
                backgroundColor: flag.severity === "high" ? "rgba(248,113,113,0.18)" : flag.severity === "medium" ? "rgba(251,191,36,0.2)" : "rgba(16,185,129,0.18)",
                color: flag.severity === "high" ? "#b91c1c" : flag.severity === "medium" ? "#92400e" : "#065f46",
              }}
            >
              {flag.label}
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-2 text-xs text-emerald-700 dark:text-emerald-300">No major risks detected.</p>
      )}
    </div>
  );
}
