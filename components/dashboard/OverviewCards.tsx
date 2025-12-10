import PICard from "../ui/PICard";

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
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      {stats.map((stat) => (
        <PICard key={stat.label} className="space-y-4">
          <div className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-600">
            {stat.label}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <div className="text-3xl font-semibold text-slate-900">{stat.value}</div>
            <span className="inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-800 border border-slate-200">
              <span className="h-2 w-2 rounded-full bg-[#0A84FF]" />
              Live
            </span>
          </div>
          {stat.helper && (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <span className="h-1.5 w-1.5 rounded-full bg-[#0A84FF]" />
              <span>{stat.helper}</span>
            </div>
          )}
        </PICard>
      ))}
    </section>
  );
}

export default OverviewCards;
