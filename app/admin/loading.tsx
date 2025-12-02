export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 px-6 py-10">
      <div className="mx-auto max-w-5xl space-y-4">
        <div className="h-10 w-64 animate-pulse rounded bg-slate-200" />
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          <div className="h-40 animate-pulse rounded-2xl border border-slate-200 bg-white" />
        </div>
        <div className="h-24 animate-pulse rounded-2xl border border-slate-200 bg-white" />
      </div>
    </div>
  );
}
