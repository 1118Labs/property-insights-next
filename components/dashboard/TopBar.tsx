type TopBarProps = {
  userName?: string;
  lastSync?: string;
};

export function TopBar({ userName = "Operations", lastSync }: TopBarProps) {
  return (
    <header className="flex items-center justify-between border-b bg-white/80 px-4 py-3 backdrop-blur md:px-8">
      <div>
        <div className="text-xs uppercase tracking-wide text-slate-500">
          Dashboard
        </div>
        <div className="text-xl font-semibold text-slate-900">
          Welcome back, {userName}
        </div>
        {lastSync && (
          <div className="text-sm text-slate-500">Last sync {lastSync}</div>
        )}
      </div>
      <div className="flex items-center gap-3">
        <button className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-500">
          Refresh
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-sm font-semibold uppercase text-white shadow-lg shadow-emerald-500/25">
          {userName.slice(0, 2)}
        </div>
      </div>
    </header>
  );
}
