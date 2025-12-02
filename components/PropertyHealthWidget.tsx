import { PropertyProfile } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";

export function PropertyHealthWidget({ profile }: { profile: PropertyProfile }) {
  const health = profile.insights;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Property health</p>
          <p className="text-sm text-slate-600">Quick view of overall score and risks</p>
        </div>
        <ScoreBadge score={health.score} />
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-slate-700 sm:grid-cols-4">
        <Tile label="Livability" value={`${Math.round(health.breakdown.livability)} / 100`} />
        <Tile label="Efficiency" value={`${Math.round(health.breakdown.efficiency)} / 100`} />
        <Tile label="Market" value={`${Math.round(health.breakdown.marketStrength)} / 100`} />
        <Tile label="Cashflow risk" value={health.breakdown.cashflowRisk !== null && health.breakdown.cashflowRisk !== undefined ? `${Math.round(health.breakdown.cashflowRisk)} / 100` : "—"} />
      </div>
    </div>
  );
}

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-sm font-semibold text-slate-900">{value}</p>
    </div>
  );
}
