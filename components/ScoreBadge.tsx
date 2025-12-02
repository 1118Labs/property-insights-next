import clsx from "clsx";

type Props = { score: number; label?: string; isLoading?: boolean };

export function ScoreBadge({ score, label, isLoading = false }: Props) {
  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-sm font-semibold text-slate-500">
        <span className="inline-flex h-6 w-6 animate-pulse items-center justify-center rounded-full bg-slate-200" />
        <span>Loading…</span>
      </div>
    );
  }

  const tone =
    score >= 80
      ? "bg-emerald-100 text-emerald-800 border-emerald-200"
      : score >= 60
      ? "bg-amber-100 text-amber-800 border-amber-200"
      : "bg-rose-100 text-rose-800 border-rose-200";
  const quality = score >= 80 ? "High quality" : score >= 60 ? "Medium quality" : "Low quality";

  return (
    <div className={clsx("inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm font-semibold shadow-sm", tone)}>
      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/70 text-xs font-bold text-slate-900">
        {Math.round(score)}
      </span>
      <span>{label || quality}</span>
    </div>
  );
}
