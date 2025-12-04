import { OverviewCards } from "@/components/dashboard/OverviewCards";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";

const stats = [
  {
    label: "Today's Jobs Count",
    value: "24",
    helper: "8 in progress, 16 scheduled",
  },
  {
    label: "Total Clients Count",
    value: "312",
    helper: "5 new this week",
  },
  {
    label: "Total Properties Count",
    value: "742",
    helper: "12 added in the last 7 days",
  },
];

const activityItems = [
  {
    title: "Dispatched crew to 1258 Lakewood Dr",
    description: "Jobber sync confirmed and client notified via portal.",
    time: "5m ago",
    status: "success" as const,
  },
  {
    title: "New client imported",
    description: "Ridgeview Apartments added with 18 linked properties.",
    time: "22m ago",
    status: "info" as const,
  },
  {
    title: "Property insights rebuilt",
    description: "Re-ran aerial analysis for 88 Oak St after edits.",
    time: "1h ago",
    status: "success" as const,
  },
  {
    title: "Quote feedback received",
    description: "Client requested changes for Job #9821 (window cleaning).",
    time: "2h ago",
    status: "warning" as const,
  },
];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <TopBar userName="Ops Team" lastSync="2 minutes ago" />
          <div className="space-y-8 px-4 py-6 md:px-8 md:py-10">
            <OverviewCards stats={stats} />
            <div className="grid gap-6 lg:grid-cols-3">
              <div className="lg:col-span-2 space-y-6">
                <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm shadow-slate-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium uppercase tracking-wide text-slate-500">
                        Today
                      </div>
                      <div className="text-base text-slate-900">
                        Snapshot of field activity
                      </div>
                    </div>
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                      Live
                    </span>
                  </div>
                  <div className="mt-4 grid gap-3 md:grid-cols-3">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        In Progress
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        8 jobs
                      </div>
                      <div className="text-sm text-slate-600">
                        3 crews on route
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Scheduled
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        16 jobs
                      </div>
                      <div className="text-sm text-slate-600">
                        All clients confirmed
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
                      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Issues
                      </div>
                      <div className="text-2xl font-semibold text-slate-900">
                        2 holds
                      </div>
                      <div className="text-sm text-slate-600">
                        Weather delay flagged
                      </div>
                    </div>
                  </div>
                </section>
              </div>
              <RecentActivity items={activityItems} />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
