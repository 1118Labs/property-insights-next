const navItems = [
  { label: "Dashboard", href: "/dashboard" },
  { label: "Jobs", href: "/jobs" },
  { label: "Clients", href: "/clients" },
  { label: "Properties", href: "/properties" },
  { label: "Schedules", href: "/schedules" },
];

export function Sidebar() {
  return (
    <aside className="hidden h-screen w-64 shrink-0 border-r bg-white/70 backdrop-blur md:flex md:flex-col">
      <div className="flex items-center gap-2 px-6 py-4">
        <div className="h-8 w-8 rounded-lg bg-emerald-600 text-white shadow-inner shadow-emerald-900/20" />
        <div>
          <div className="text-sm text-slate-500">Operations</div>
          <div className="text-base font-semibold text-slate-900">
            Property Insights
          </div>
        </div>
      </div>
      <nav className="space-y-1 px-2 pb-6">
        {navItems.map((item) => (
          <a
            key={item.href}
            href={item.href}
            className="flex items-center justify-between rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-emerald-50 hover:text-emerald-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500"
          >
            <span>{item.label}</span>
            {item.label === "Dashboard" && (
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
            )}
          </a>
        ))}
      </nav>
      <div className="mt-auto border-t px-6 py-4 text-xs text-slate-500">
        Showing Dashboard Option A
      </div>
    </aside>
  );
}
