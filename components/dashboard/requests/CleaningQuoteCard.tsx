import { BaseQuoteResult, ServiceType } from "./types";

type CleaningQuoteCardProps = {
  quote: BaseQuoteResult & { trade?: ServiceType };
};

function formatMoney(value: number) {
  return `$${Math.round(value).toLocaleString()}`;
}

function tradeLabel(trade?: ServiceType) {
  switch (trade) {
    case "pressure_washing":
      return { title: "Pressure washing quote", subtitle: "Exterior surface cleaning estimate" };
    case "window_washing":
      return { title: "Window washing quote", subtitle: "Glass and screen detailing estimate" };
    case "lawn_care":
      return { title: "Lawn care quote", subtitle: "Recurring yard maintenance estimate" };
    case "handyman":
      return { title: "Handyman quote", subtitle: "General labor estimate" };
    default:
      return { title: "Cleaning quote", subtitle: "Interior residential cleaning estimate" };
  }
}

export default function CleaningQuoteCard({ quote }: CleaningQuoteCardProps) {
  const labels = tradeLabel(quote.trade);
  return (
    <div className="space-y-3 rounded-3xl border border-white/30 bg-white/85 p-4 text-sm text-[#021C36] shadow-lg shadow-[#021C36]/10 backdrop-blur">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
            {labels.title} (beta)
          </div>
          <div className="text-2xl font-bold text-[#021C36]">
            {formatMoney(quote.customerPrice)}
          </div>
          <div className="text-xs text-slate-500">{labels.subtitle}</div>
          <div className="text-xs text-slate-500">
            Range {formatMoney(quote.lowHighRange.low)}–{formatMoney(quote.lowHighRange.high)}
          </div>
        </div>
        <div className="rounded-full bg-[#14D8FF]/15 px-3 py-1 text-[11px] font-semibold text-[#021C36]">
          {quote.recommendedCrewSize} crew • {quote.estimatedHoursPerCrew} hrs/crew
        </div>
      </div>

      {quote.riskFlags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {quote.riskFlags.map((flag) => (
            <span
              key={flag}
              className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800"
            >
              ⚠️ {flag}
            </span>
          ))}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs text-slate-600">
        <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 shadow-inner shadow-[#021C36]/5">
          <div className="font-semibold text-[#021C36]">Estimated minutes</div>
          <div>{quote.estimatedMinutes.toLocaleString()} min</div>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 shadow-inner shadow-[#021C36]/5">
          <div className="font-semibold text-[#021C36]">Crew size</div>
          <div>{quote.recommendedCrewSize}</div>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 shadow-inner shadow-[#021C36]/5">
          <div className="font-semibold text-[#021C36]">Hours per crew</div>
          <div>{quote.estimatedHoursPerCrew} hrs</div>
        </div>
        <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-2 shadow-inner shadow-[#021C36]/5">
          <div className="font-semibold text-[#021C36]">Base price</div>
          <div>{formatMoney(quote.basePrice)}</div>
        </div>
      </div>

      <div className="rounded-xl border border-white/60 bg-white/70 px-3 py-3 text-xs text-slate-700 shadow-inner shadow-[#021C36]/5">
        <div className="font-semibold text-[#021C36]">Assumptions</div>
        <ul className="mt-1 space-y-1 list-disc pl-4">
          {quote.assumptions.map((assumption) => (
            <li key={assumption}>{assumption}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}
