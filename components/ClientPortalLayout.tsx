"use client";

import Link from "next/link";
import { ReactNode } from "react";
import { portalBranding } from "@/lib/portal/config";

export function ClientPortalLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-slate-900">
      <div className="mx-auto flex max-w-4xl flex-col gap-6 px-4 py-8 sm:px-6 lg:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-600" />
            <div>
              <p className="text-sm font-semibold" style={{ color: portalBranding.primaryColor }}>
                Property Insights
              </p>
              <p className="text-xs text-slate-500">{portalBranding.subtitle}</p>
            </div>
          </div>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 transition hover:text-slate-700"
          >
            Back to site
          </Link>
        </header>
        <p className="text-xs uppercase tracking-wide text-slate-500">Client Portal</p>
        <main className="space-y-6">{children}</main>
        <footer className="text-center text-[11px] text-slate-500">Secure client portal · Link expires after 7 days</footer>
      </div>
    </div>
  );
}
