type PropertyHeaderProps = {
  addressLine: string;
  subtitle?: string;
};

export function PropertyHeader({ addressLine, subtitle }: PropertyHeaderProps) {
  return (
    <div className="space-y-1">
      <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">
        Property
      </p>
      <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">
        {addressLine || "Property"}
      </h1>
      {subtitle && (
        <p className="text-sm text-slate-600 dark:text-slate-300">{subtitle}</p>
      )}
    </div>
  );
}
