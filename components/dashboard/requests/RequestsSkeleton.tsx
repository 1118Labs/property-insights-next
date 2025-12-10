export default function RequestsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="h-5 w-64 animate-pulse rounded-full bg-white/60" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 5 }).map((_, idx) => (
          <div
            key={idx}
            className="h-9 w-28 animate-pulse rounded-full bg-white/70 shadow-sm shadow-[#021C36]/10"
          />
        ))}
      </div>
      <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/90 shadow-xl shadow-[#021C36]/10 backdrop-blur">
        <div className="border-b border-slate-200/80 bg-gradient-to-r from-white via-[#f5fbff] to-white px-4 py-4">
          <div className="h-4 w-32 animate-pulse rounded-full bg-slate-200/80" />
        </div>
        <div className="divide-y divide-slate-100/80">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div key={idx} className="grid grid-cols-4 gap-4 px-4 py-5">
              {Array.from({ length: 4 }, (_value, colIdx) => colIdx).map(
                (colIdx) => (
                  <div
                    key={colIdx}
                    className="h-4 w-full animate-pulse rounded-full bg-slate-200/80"
                  />
                )
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
