type ActivityItem = {
  title: string;
  time: string;
  description: string;
  status?: "success" | "warning" | "info";
};

type RecentActivityProps = {
  items: ActivityItem[];
};

const statusColors: Record<NonNullable<ActivityItem["status"]>, string> = {
  success: "bg-emerald-500/90",
  warning: "bg-amber-500/90",
  info: "bg-sky-500/90",
};

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
            Recent Activity
          </div>
          <div className="text-base text-slate-900">
            Latest operations across jobs, clients, and properties
          </div>
        </div>
        <a
          href="#"
          className="text-sm font-semibold text-emerald-600 transition hover:text-emerald-700"
        >
          View all
        </a>
      </div>
      <div className="mt-5 space-y-4">
        {items.map((item) => (
          <div key={item.title} className="flex items-start gap-4">
            <div
              className={`mt-1 h-2.5 w-2.5 rounded-full ${
                item.status ? statusColors[item.status] : "bg-slate-300"
              }`}
            />
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <div className="text-sm font-semibold text-slate-900">
                  {item.title}
                </div>
                <div className="text-xs text-slate-500">{item.time}</div>
              </div>
              <div className="text-sm text-slate-600">{item.description}</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
