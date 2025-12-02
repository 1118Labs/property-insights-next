"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { HealthStatusBanner } from "@/components/HealthStatusBanner";

type Health = {
  status: string;
  supabase?: { status: string };
  jobber?: { status: string; daysRemaining?: number | null };
  providers?: Array<{ label: string; circuitOpen?: boolean }>;
};

const NAV_LINKS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/ingestion-log", label: "Ingestion & Logs" },
  { href: "/admin/providers", label: "Provider Diagnostics" },
  { href: "/admin/health", label: "Settings / Health" },
];

const safeModeEnabled = process.env.NEXT_PUBLIC_SAFE_MODE === "true";

export function AdminShell({ children, active }: { children: React.ReactNode; active?: string }) {
  const [health, setHealth] = useState<Health | null>(null);
  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof document !== "undefined" && document.documentElement.classList.contains("dark")) return "dark";
    return "light";
  });

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((body) => setHealth(body))
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    if (typeof window !== "undefined") {
      localStorage.setItem("pi-theme", theme);
    }
  }, [theme]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("pi-theme");
    if (stored === "dark" || stored === "light") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setTheme(stored);
    }
  }, []);

  const [pathname, setPathname] = useState<string | null>(null);
  useEffect(() => {
    if (typeof window !== "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPathname(window.location.pathname);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 py-6 text-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-slate-50">
      <div className="mx-auto max-w-6xl space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-600 dark:text-emerald-300">Admin</p>
            <h1 className="text-2xl font-semibold">Operations Console</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Health, ingestion, providers, and settings.</p>
          </div>
          <div className="flex items-center gap-2">
            {safeModeEnabled && <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">Safe mode</span>}
            <button
              onClick={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
              className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </button>
            <Link href="/" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              ← Back
            </Link>
          </div>
        </div>

        {health && (
          <HealthStatusBanner
            status={health.status}
            supabase={health.supabase?.status}
            jobber={health.jobber?.status}
            providerCount={health.providers?.length}
            detail={health.jobber?.daysRemaining !== undefined ? `Token days: ${health.jobber?.daysRemaining ?? "n/a"}` : undefined}
          />
        )}

        <div className="flex flex-wrap gap-2">
          {NAV_LINKS.map((link) => {
            const activeLink = active ? link.href === active : pathname ? pathname.startsWith(link.href) : false;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-full border px-3 py-1 text-sm font-semibold shadow-sm ${
                  activeLink
                    ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-400 dark:bg-emerald-900/40 dark:text-emerald-100"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">{children}</div>
      </div>
    </div>
  );
}
