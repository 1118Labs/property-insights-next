type PropertySpecsProps = {
  beds?: number;
  baths?: number;
  sqft?: number;
  lotSize?: number;
  yearBuilt?: number;
  estimatedValue?: number;
  valuationLow?: number;
  valuationHigh?: number;
};

const formatNum = (value?: number) =>
  typeof value === "number" ? value.toLocaleString() : "—";

export function PropertySpecs({
  beds,
  baths,
  sqft,
  lotSize,
  yearBuilt,
  estimatedValue,
  valuationLow,
  valuationHigh,
}: PropertySpecsProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/60">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        <Spec label="Beds" value={formatNum(beds)} />
        <Spec label="Baths" value={formatNum(baths)} />
        <Spec label="Sqft" value={formatNum(sqft)} />
        <Spec label="Lot size" value={lotSize ? `${formatNum(lotSize)} sqft` : "—"} />
        <Spec label="Year built" value={yearBuilt ? String(yearBuilt) : "—"} />
        <div className="space-y-1">
          <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Estimated value
          </div>
          <div className="text-base font-semibold text-slate-900 dark:text-white">
            {estimatedValue
              ? `$${formatNum(Math.round(estimatedValue))}`
              : valuationLow && valuationHigh
              ? `$${formatNum(Math.round(valuationLow))} - $${formatNum(Math.round(valuationHigh))}`
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="text-base font-semibold text-slate-900 dark:text-white">
        {value}
      </div>
    </div>
  );
}
