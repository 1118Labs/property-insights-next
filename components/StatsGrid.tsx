export type StatItem = {
  label: string;
  value: string | number;
  helper?: string;
};

export function StatsGrid({ stats, loading = false }: { stats: StatItem[]; loading?: boolean }) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-xs uppercase tracking-wide text-slate-500">{stat.label}</p>
          {loading ? (
            <div className="mt-1 h-6 w-20 animate-pulse rounded bg-slate-200" />
          ) : (
            <p className="text-2xl font-semibold text-slate-900">{stat.value}</p>
          )}
          {stat.helper && <p className="text-xs text-slate-600">{stat.helper}</p>}
        </div>
      ))}
    </div>
  );
}
