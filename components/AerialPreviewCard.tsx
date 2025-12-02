"use client";

type Props = {
  imageUrl?: string;
  provider?: string;
  overlayLabel?: string;
};

export function AerialPreviewCard({ imageUrl, provider, overlayLabel }: Props) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Aerial preview</p>
        {provider && <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:bg-slate-700 dark:text-slate-100">{provider}</span>}
      </div>
      <div className="mt-2 h-48 w-full overflow-hidden rounded-xl bg-slate-100 dark:bg-slate-700">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={imageUrl} alt="Aerial" className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-slate-500">No imagery available</div>
        )}
      </div>
      {overlayLabel && <p className="mt-2 text-xs text-slate-600 dark:text-slate-300">{overlayLabel}</p>}
    </div>
  );
}
