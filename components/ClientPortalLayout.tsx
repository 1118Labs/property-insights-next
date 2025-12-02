"use client";

import { ReactNode } from "react";
import { portalBranding } from "@/lib/portal/config";

export function ClientPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 text-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-10 w-10 rounded-xl bg-emerald-600" />
            <div>
              <p className="text-sm font-semibold" style={{ color: portalBranding.primaryColor }}>
                Property Insights
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-300">{portalBranding.subtitle}</p>
            </div>
          </div>
          <a href="/" className="text-xs font-semibold text-slate-500 dark:text-slate-300">
            Back to site
          </a>
        </header>
        <main className="space-y-4">{children}</main>
        <footer className="text-center text-[11px] text-slate-500 dark:text-slate-400">Secure client portal · Link expires after 7 days</footer>
      </div>
    </div>
  );
}
