export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-4 py-8 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-5xl space-y-3">
        <div className="h-10 w-32 animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
        <div className="h-40 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      </div>
    </div>
  );
}
