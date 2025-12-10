import PICard from "../ui/PICard";

type ActivityItem = {
  title: string;
  time: string;
  description: string;
  status?: "success" | "warning" | "info";
};

type RecentActivityProps = {
  items: ActivityItem[];
};

export function RecentActivity({ items }: RecentActivityProps) {
  return (
    <PICard>
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
            Recent Activity
          </div>
          <div className="text-lg font-semibold text-slate-900">
            Latest operations across jobs, clients, and properties
          </div>
        </div>
        <a
          href="#"
          className="text-sm font-semibold text-[#0A84FF] transition hover:underline"
        >
          View all
        </a>
      </div>
      <div className="relative mt-6">
        <div className="absolute left-3 top-2 bottom-2 w-px bg-slate-200" aria-hidden />
        <div className="space-y-6">
          {items.map((item, index) => {
            const isEnrichment =
              item.title.toLowerCase().includes("insight") ||
              item.description.toLowerCase().includes("enrich");
            return (
              <div key={`${item.title}-${index}`} className="relative flex gap-4 pl-6">
                <span
                  className={`absolute left-0 top-1.5 h-3 w-3 rounded-full ${
                    isEnrichment ? "bg-[#0A84FF]" : "bg-slate-300"
                  }`}
                  aria-hidden
                />
                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-semibold text-slate-900">
                      {item.title}
                    </div>
                    <div className="text-xs text-slate-500">{item.time}</div>
                  </div>
                  <div className="text-sm text-slate-600">{item.description}</div>
                  {item.status && (
                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                      {item.status}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </PICard>
  );
}

export default RecentActivity;
