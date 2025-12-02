"use client";

type Props = { label: string; className?: string };

export function InfoTooltip({ label, className }: Props) {
  return (
    <span
      tabIndex={0}
      aria-label={label}
      title={label}
      className={`ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full border border-slate-300 text-[10px] font-semibold text-slate-500 outline-none focus:ring-2 focus:ring-emerald-300 ${className || ""}`}
    >
      i
    </span>
  );
}
