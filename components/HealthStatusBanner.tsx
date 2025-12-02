import { clsx } from "clsx";

type Props = {
  status: "ok" | "degraded" | "error" | string;
  detail?: string;
  supabase?: string;
  jobber?: string;
  providerCount?: number;
};

export function HealthStatusBanner({ status, detail, supabase, jobber, providerCount }: Props) {
  const tone =
    status === "ok"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-100"
      : status === "degraded"
      ? "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-800 dark:bg-amber-900/30 dark:text-amber-100"
      : "border-rose-200 bg-rose-50 text-rose-800 dark:border-rose-800 dark:bg-rose-900/30 dark:text-rose-100";

  return (
    <div className={clsx("rounded-xl border px-4 py-2 text-sm font-semibold", tone)}>
      <div className="flex flex-wrap items-center gap-2">
        <span>Health: {status}</span>
        {detail && <span className="text-xs font-normal">{detail}</span>}
        {supabase && <Badge label={`Supabase: ${supabase}`} />}
        {jobber && <Badge label={`Jobber: ${jobber}`} />}
        {providerCount !== undefined && <Badge label={`Providers: ${providerCount}`} />}
      </div>
    </div>
  );
}

function Badge({ label }: { label: string }) {
  return <span className="rounded-full bg-white/60 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-white/10 dark:text-slate-100">{label}</span>;
}
