import { RiskFlag } from "@/lib/types";

export function RiskPills({ flags }: { flags: RiskFlag[] }) {
  const preset = getPreset();
  if (!flags?.length && !preset.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {flags.map((flag) => (
        <span
          key={flag.code}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-slate-100 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
          title={flag.detail || flag.label}
          tabIndex={0}
          aria-label={`${flag.label}${flag.detail ? `: ${flag.detail}` : ""}`}
        >
          <Dot tone={flag.severity} />
          {flag.label}
        </span>
      ))}
      {preset.map((p) => (
        <span
          key={p.label}
          className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-gradient-to-r from-slate-50 via-white to-emerald-50 px-3 py-1 text-xs font-medium text-slate-700 shadow-sm"
        >
          <Dot tone={p.severity as RiskFlag["severity"]} />
          {p.label}
        </span>
      ))}
    </div>
  );
}

function Dot({ tone }: { tone: RiskFlag["severity"] }) {
  const color =
    tone === "high"
      ? "bg-gradient-to-r from-rose-500 to-rose-400"
      : tone === "medium"
      ? "bg-gradient-to-r from-amber-500 to-amber-400"
      : "bg-gradient-to-r from-emerald-500 to-emerald-400";

  return <span className={`h-2 w-2 rounded-full ${color}`} aria-hidden />;
}

function getPreset() {
  return [
    { label: "Zoning risk", severity: "medium" },
    { label: "Pricing risk", severity: "medium" },
    { label: "Permit risk", severity: "high" },
    { label: "Comp mismatch", severity: "low" },
  ] as const;
}
