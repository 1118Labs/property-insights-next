type Props = {
  provider: string;
  open: boolean;
  until?: number | null;
};

export function CircuitBreakerIndicator({ provider, open, until }: Props) {
  const label = open ? "Circuit open" : "Circuit closed";
  return (
    <div className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${open ? "bg-amber-100 text-amber-800 dark:bg-amber-900/50 dark:text-amber-200" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"}`}>
      <span>⚡ {provider}</span>
      <span>{label}</span>
      {open && until ? <span className="text-[10px] text-amber-700 dark:text-amber-200">until {new Date(until).toLocaleTimeString()}</span> : null}
    </div>
  );
}
