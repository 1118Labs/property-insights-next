type Props = {
  address?: string;
  highlight?: string;
  className?: string;
};

export function StaticMapPreview({ address, highlight, className }: Props) {
  return (
    <div
      className={`rounded-xl border border-slate-200 bg-gradient-to-br from-sky-50 via-slate-50 to-slate-100 p-4 shadow-sm dark:border-slate-700 dark:from-slate-800 dark:via-slate-900 dark:to-slate-800 ${className || ""}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-sky-100 text-xl dark:bg-slate-700">🗺️</div>
        <div className="text-sm text-slate-700 dark:text-slate-200">
          <p className="font-semibold text-slate-900 dark:text-white">{address || "Map preview unavailable"}</p>
          <p className="text-xs text-slate-600 dark:text-slate-400">
            Static map placeholder. Hook up Leaflet or Maps SDK when keys are present.
            {highlight ? ` Focus: ${highlight}.` : ""}
          </p>
        </div>
      </div>
    </div>
  );
}
