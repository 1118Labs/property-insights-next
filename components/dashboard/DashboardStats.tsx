type StatItem = {
  label: string;
  value: string;
  helper?: string;
};

export default function DashboardStats({ stats }: { stats: StatItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md"
        >
          <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
          <p className="mt-2 text-2xl font-semibold text-gray-900">{stat.value}</p>
          {stat.helper && <p className="mt-1 text-sm text-gray-600">{stat.helper}</p>}
        </div>
      ))}
    </div>
  );
}
