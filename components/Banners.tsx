import clsx from "clsx";

type BannerProps = { message: string; children?: React.ReactNode };

export function WarningBanner({ message, children }: BannerProps) {
  return (
    <div className={clsx("rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 shadow-sm")}
      role="status"
    >
      <div className="font-semibold">{message}</div>
      {children && <div className="text-xs text-amber-700">{children}</div>}
    </div>
  );
}

export function SuccessBanner({ message, children }: BannerProps) {
  return (
    <div className={clsx("rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 shadow-sm")}
      role="status"
    >
      <div className="font-semibold">{message}</div>
      {children && <div className="text-xs text-emerald-700">{children}</div>}
    </div>
  );
}
