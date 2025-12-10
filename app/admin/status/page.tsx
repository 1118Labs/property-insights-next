"use client";

import { useEffect, useState } from "react";
import { HealthStatusBanner } from "@/components/HealthStatusBanner";

type Health = { status: string; jobber?: { status?: string; daysRemaining?: number | null }; supabase?: { status?: string }; providers?: Record<string, unknown> };
type PlatformHealth = { slug: string; name: string; configured: boolean; health: { status: string; detail?: string } };

export default function AdminStatusPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [uptime] = useState<string>("—");
  const [failures] = useState<number>(0);
  const [platforms, setPlatforms] = useState<PlatformHealth[]>([]);
  const [summary, setSummary] = useState<{ total?: number }>({});

  useEffect(() => {
    fetch("/api/health")
      .then((r) => r.json())
      .then((b) => setHealth(b))
      .catch(() => {});
    fetch("/api/platform-health")
      .then((r) => r.json())
      .then((b) => setPlatforms(b.data || []))
      .catch(() => {});
    fetch("/api/properties")
      .then((r) => r.json())
      .then((b) => setSummary({ total: b.data?.summary?.total }))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      {health && (
        <HealthStatusBanner
          status={health.status}
          supabase={health.supabase?.status}
          jobber={health.jobber?.status}
          providerCount={health.providers ? Object.keys(health.providers).length : undefined}
          detail={health.jobber?.daysRemaining !== undefined ? `Token days: ${health.jobber?.daysRemaining ?? "n/a"}` : undefined}
        />
      )}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Uptime</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">{uptime}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">Placeholder until real metrics wired</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent failures</p>
          <p className="text-2xl font-bold text-rose-700 dark:text-rose-300">{failures}</p>
          <p className="text-xs text-slate-600 dark:text-slate-300">Check provider dashboard for details</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Platform health</p>
        <div className="mt-3 grid gap-2 sm:grid-cols-3">
          {platforms.length === 0 && <p className="text-xs text-slate-500 dark:text-slate-300">No platform data yet.</p>}
          {platforms.map((p) => (
            <div key={p.slug} className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm dark:border-slate-700 dark:bg-slate-800">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 dark:text-white">{p.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${p.health?.status === "ok" ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200" : "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200"}`}>
                  {p.health?.status || "unknown"}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-300">
                {p.configured ? p.health?.detail || "Configured" : "Env vars missing"}
              </p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Sanity dashboard</p>
        <p className="text-xs text-slate-600 dark:text-slate-300">Cross-platform ingest snapshot.</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">Active platform</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{platforms.find((p) => p.health?.status === "ok")?.name || "Jobber (default)"}</p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-800">
            <p className="text-[11px] uppercase tracking-wide text-slate-500 dark:text-slate-300">Properties</p>
            <p className="text-lg font-semibold text-slate-900 dark:text-white">{summary.total ?? "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
