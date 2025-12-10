type PropertyMapProps = {
  mapImageUrl?: string | null;
  lat?: number;
  lng?: number;
};

export function PropertyMap({ mapImageUrl, lat, lng }: PropertyMapProps) {
  if (!mapImageUrl) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:text-slate-200">
        <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          Map preview
        </div>
        <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50 p-6 text-center text-xs text-slate-500 shadow-inner dark:border-slate-800 dark:bg-slate-900">
          Map snapshot unavailable for this property.
          {lat && lng ? (
            <div className="mt-2 text-[11px] text-slate-500 dark:text-slate-400">
              Lat {lat}, Lng {lng}
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 px-2 pt-2">
        Map preview
      </div>
      <div className="mt-2 overflow-hidden rounded-xl border border-slate-100 shadow-sm dark:border-slate-800">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={mapImageUrl}
          alt="Property map snapshot"
          className="h-full w-full object-cover"
          loading="lazy"
        />
      </div>
    </div>
  );
}
