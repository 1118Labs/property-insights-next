type Props = { count?: number; aspect?: string };

export function PhotoPlaceholder({ count = 3, aspect = "aspect-video" }: Props) {
  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className={`${aspect} overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-100 via-slate-200 to-slate-100 dark:border-slate-700 dark:from-slate-800 dark:via-slate-700 dark:to-slate-800`}
        >
          <div className="h-full w-full animate-pulse bg-slate-200/60 dark:bg-slate-700/60" />
        </div>
      ))}
    </div>
  );
}
