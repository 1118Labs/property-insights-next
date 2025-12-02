export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-6 py-10">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="h-60 animate-pulse rounded-2xl border border-slate-200 bg-white" />
          ))}
        </div>
      </div>
    </div>
  );
}
