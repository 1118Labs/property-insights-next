"use client";

type AerialPreviewProps = {
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
};

export default function AerialPreview({
  latitude,
  longitude,
  className,
}: AerialPreviewProps) {
  const hasCoords =
    typeof latitude === "number" && !Number.isNaN(latitude) &&
    typeof longitude === "number" && !Number.isNaN(longitude);

  return (
    <div
      className={`rounded-2xl border border-white/25 bg-white/95 p-4 shadow-lg shadow-[#021C36]/10 backdrop-blur ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-[#021C36]">Aerial view</div>
          <div className="text-xs text-slate-500">3D Flyover placeholder</div>
        </div>
        {hasCoords && (
          <span className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-white shadow-sm shadow-[#021C36]/20">
            <span className="h-2 w-2 rounded-full bg-[#14D8FF]" />
            Apple chrome
          </span>
        )}
      </div>

      {hasCoords ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200/70 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 shadow-inner shadow-[#021C36]/10">
          <div className="flex items-center gap-2 border-b border-white/10 bg-white/5 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-slate-200">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(16,185,129,0.25)]" />
            3D Flyover not available
          </div>
          <div className="relative h-56">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(20,216,255,0.18),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(255,255,255,0.12),transparent_30%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.05)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.05)_50%,rgba(255,255,255,0.05)_75%,transparent_75%,transparent)] bg-[length:16px_16px] opacity-30" />
            <div className="absolute inset-4 rounded-2xl border border-white/15 bg-gradient-to-b from-white/10 via-white/5 to-transparent shadow-[0_20px_40px_-28px_rgba(0,0,0,0.8)]" />
            <div className="absolute left-6 top-6 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-[11px] font-semibold text-white">
              Satellite offline
            </div>
            <div className="absolute bottom-4 right-4 rounded-full bg-white/85 px-3 py-1 text-[11px] font-semibold text-[#021C36] shadow-sm shadow-[#021C36]/10">
              {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
            </div>
          </div>
          <div className="border-t border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200">
            Hook up MapKit JS flyover when credentials are provided.
          </div>
        </div>
      ) : (
        <div className="mt-3 flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200/90 bg-gradient-to-br from-white to-[#f4f8fb] px-4 py-10 text-center text-sm text-slate-600 shadow-inner shadow-[#021C36]/5">
          No coordinates available yet.
        </div>
      )}
    </div>
  );
}
