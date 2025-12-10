"use client";

import { useState } from "react";

type HintProps = {
  title: string;
  body: string;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
};

export default function Hint({
  title,
  body,
  actionHref,
  actionLabel,
  className,
}: HintProps) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border border-white/25 bg-white/15 p-4 text-sm text-white shadow-lg shadow-[#021C36]/20 backdrop-blur ${className ?? ""}`}
    >
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#14D8FF]/20 text-lg">
        ✨
      </div>
      <div className="flex-1 space-y-1">
        <div className="text-sm font-semibold text-white">{title}</div>
        <div className="text-xs text-white/80">{body}</div>
        {actionHref && actionLabel && (
          <a
            href={actionHref}
            className="inline-flex items-center gap-2 rounded-full bg-[#14D8FF] px-3 py-1 text-[11px] font-semibold text-[#021C36] shadow-[0_10px_24px_-16px_rgba(20,216,255,0.8)] transition hover:-translate-y-0.5"
          >
            {actionLabel}
          </a>
        )}
      </div>
      <button
        onClick={() => setDismissed(true)}
        className="text-xs text-white/60 transition hover:text-white"
      >
        Dismiss
      </button>
    </div>
  );
}
