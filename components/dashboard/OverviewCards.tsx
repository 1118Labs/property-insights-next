type StatCard = {
  label: string;
  value: string;
  helper?: string;
};

type OverviewCardsProps = {
  stats: StatCard[];
};

export function OverviewCards({ stats }: OverviewCardsProps) {
  return (
    <section className="grid gap-4 md:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm shadow-slate-100"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-medium text-slate-500">
              {stat.label}
            </div>
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
          </div>
          <div className="mt-3 text-3xl font-semibold text-slate-900">
            {stat.value}
          </div>
          {stat.helper && (
            <div className="mt-1 text-sm text-slate-500">{stat.helper}</div>
          )}
        </div>
      ))}
    </section>
  );
}
