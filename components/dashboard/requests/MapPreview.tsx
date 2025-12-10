"use client";

type MapPreviewProps = {
  latitude?: number | null;
  longitude?: number | null;
  className?: string;
};

export default function MapPreview({
  latitude,
  longitude,
  className,
}: MapPreviewProps) {
  const hasCoords =
    typeof latitude === "number" && !Number.isNaN(latitude) &&
    typeof longitude === "number" && !Number.isNaN(longitude);

  return (
    <div
      className={`rounded-xl border border-slate-200 bg-white p-4 shadow-sm ${className ?? ""}`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="text-sm font-semibold text-slate-900">Map preview</div>
          <div className="text-xs text-slate-500">
            Apple Maps static placeholder
          </div>
        </div>
        {hasCoords && (
          <span className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold text-slate-800">
            <span className="h-2 w-2 rounded-full bg-[#0A84FF]" />
            Ready for MapKit
          </span>
        )}
      </div>

      {hasCoords ? (
        <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-inner">
          <div className="relative h-56 bg-slate-50" />
          <div className="border-t border-slate-200 bg-white px-4 py-2 text-xs text-slate-600">
            Map tiles will render here once MapKit JS is wired.
          </div>
        </div>
      ) : (
        <div className="mt-3 flex min-h-[220px] items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
          No coordinates available yet.
        </div>
      )}
    </div>
  );
}
