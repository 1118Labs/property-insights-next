"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { JobberConnectionMonitor } from "@/components/JobberConnectionMonitor";
import { ManualIngestModal } from "@/components/ManualIngestModal";
import { RebuildInsightsModal } from "@/components/RebuildInsightsModal";
import { ProviderDiagnosticsDashboard } from "@/components/ProviderDiagnosticsDashboard";
import { RiskFactorBreakdown } from "@/components/RiskFactorBreakdown";
import { PropertyProvenancePanel } from "@/components/PropertyProvenancePanel";
import { PropertyHistoryPanel } from "@/components/PropertyHistoryPanel";
import { AddressNormalizePreview } from "@/components/AddressNormalizePreview";
import { StaticMapPreview } from "@/components/StaticMapPreview";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { FeedbackModal } from "@/components/FeedbackModal";
import { PlatformSelector } from "@/components/PlatformSelector";
import { QuickEstimateForm } from "@/components/QuickEstimateForm";
import { PropertyProfile } from "@/lib/types";
import { logAnalyticsEvent } from "@/lib/utils/analytics";

type Health = {
  jobber?: { status?: string; daysRemaining?: number | null; expiresAt?: number | string | null };
  providers?: Array<{ label: string; circuitOpen?: boolean }>;
  status?: string;
};

export default function AdminPage() {
  const [health, setHealth] = useState<Health | null>(null);
  const [manualOpen, setManualOpen] = useState(false);
  const [rebuildOpen, setRebuildOpen] = useState(false);
  const [enrichResult, setEnrichResult] = useState<PropertyProfile | null>(null);
  const [feedbackOpen, setFeedbackOpen] = useState(false);
  const [recap, setRecap] = useState<{ total?: number; highRisk?: number; lastIngest?: string | null }>({});
  const [platformActive, setPlatformActive] = useState<string>("jobber");
  const safeMode = process.env.NEXT_PUBLIC_SAFE_MODE === "true";
  const demoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

  const refresh = useCallback(async () => {
    const res = await fetch("/api/health");
    const body = await res.json().catch(() => ({}));
    setHealth(body);
  }, []);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    fetch("/api/properties")
      .then((r) => r.json())
      .then((body) => setRecap({ total: body.data?.summary?.total, highRisk: body.data?.summary?.highRisk }))
      .catch(() => {});
    fetch("/api/ingestion-events?limit=1")
      .then((r) => r.json())
      .then((body) => setRecap((prev) => ({ ...prev, lastIngest: body.data?.[0]?.created_at || null })))
      .catch(() => {});
    fetch("/api/platform-config")
      .then((r) => r.json())
      .then((body) => setPlatformActive(body.data?.active || "jobber"))
      .catch(() => {});
  }, [refresh]);

  const previewEnrich = async () => {
    const res = await fetch("/api/mock-property-insights");
    const body = await res.json();
    setEnrichResult(body.data || null);
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Jobber Connection</p>
            <button onClick={refresh} className="text-xs font-semibold text-slate-600 underline-offset-2 hover:underline dark:text-slate-300">Refresh</button>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-300">Live token health and expiry.</p>
          <div className="mt-3">
            <JobberConnectionMonitor
              tokenStatus={health?.jobber?.status}
              expiresAt={health?.jobber?.expiresAt || null}
              failureCount={0}
              lastRefresh={undefined}
            />
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <a href="/api/jobber/authorize" className="rounded-lg bg-emerald-600 px-3 py-2 font-semibold text-white shadow hover:bg-emerald-700">Connect</a>
            <button
              onClick={() => { setManualOpen(true); logAnalyticsEvent("ingest_modal_opened"); }}
              disabled={safeMode || demoMode}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Run ingestion"
            >
              Run ingest
            </button>
            <button
              onClick={() => { setRebuildOpen(true); logAnalyticsEvent("rebuild_modal_opened"); }}
              disabled={safeMode || demoMode}
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
              aria-label="Rebuild insights"
            >
              Rebuild insights
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Provider health</p>
            <Link href="/admin/providers" className="text-xs font-semibold text-emerald-700 underline-offset-2 hover:underline dark:text-emerald-300">View dashboard</Link>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-300">Circuits and uptime</p>
          <div className="mt-3 space-y-1 text-xs text-slate-700 dark:text-slate-200">
            {health?.providers?.length
              ? health.providers.map((p) => (
                  <div key={p.label} className="flex items-center justify-between rounded border border-slate-100 bg-slate-50 px-2 py-1 dark:border-slate-800 dark:bg-slate-800/70">
                    <span className="font-semibold">{p.label}</span>
                    <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${p.circuitOpen ? "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200" : "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200"}`}>
                      {p.circuitOpen ? "Circuit open" : "Healthy"}
                    </span>
                  </div>
                ))
              : <p className="text-xs text-slate-500 dark:text-slate-300">No provider telemetry yet.</p>}
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Exports</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-300">Internal diagnostics</p>
          </div>
          <div className="mt-3 flex flex-wrap gap-2 text-sm">
            <a className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" href="/api/export/properties.csv">Properties CSV</a>
            <a className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" href="/api/export/insights.csv">Insights CSV</a>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
            <button onClick={previewEnrich} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">Preview mock insight</button>
            <Link href="/properties" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-center text-sm font-semibold text-slate-700 shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">Open portfolio</Link>
          </div>
        </div>
      </div>

      <PlatformSelector />

      <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
        <span className="font-semibold text-slate-900 dark:text-white">Need guidance?</span>
        <a href="/docs/getting-started" className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200 dark:bg-emerald-900/40 dark:text-emerald-200">Getting Started</a>
        <a href="/docs/known-limitations" className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-100">Known Limitations</a>
        <button onClick={() => setFeedbackOpen(true)} className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white shadow hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900">
          Feedback / Notes
        </button>
      </div>

      {safeMode && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
          Safe mode enabled: ingestion and rebuild actions are disabled to prevent writes.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-3">
          <ProviderDiagnosticsDashboard autoRefreshMs={12000} />
          {enrichResult ? <PropertyProvenancePanel profile={enrichResult} /> : null}
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
            <p className="text-sm font-semibold text-slate-900 dark:text-white">Session recap</p>
            <p className="text-xs text-slate-500 dark:text-slate-300">Quick snapshot for this session.</p>
            <div className="mt-3 space-y-2 text-sm">
              <div className="flex items-center justify-between">
                <span>Properties tracked</span>
                <span className="font-semibold">{recap.total ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>High-risk count</span>
                <span className="font-semibold text-rose-700 dark:text-rose-300">{recap.highRisk ?? "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Last ingest</span>
                <span className="text-xs text-slate-600 dark:text-slate-300">{recap.lastIngest ? new Date(recap.lastIngest).toLocaleString() : "Not yet"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Provider health</span>
                <span className="text-xs text-slate-600 dark:text-slate-300">{health?.status || "—"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Platform</span>
                <span className="text-xs text-slate-600 dark:text-slate-300 uppercase">{platformActive}</span>
              </div>
            </div>
          </div>
          {enrichResult ? (
            <>
              <RiskFactorBreakdown breakdown={enrichResult.insights.breakdown} flags={enrichResult.insights.riskFlags} />
              <PropertyHistoryPanel profile={enrichResult} />
            </>
          ) : (
            <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
              <p className="font-semibold text-slate-900 dark:text-white">Run preview</p>
              <p className="text-xs text-slate-600 dark:text-slate-300">Load a mock insight to view history and risk breakdown.</p>
            </div>
          )}
          <AddressNormalizePreview />
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <StaticMapPreview address="123 Harbor Lane, Southold, NY" />
        <PhotoPlaceholder />
      </div>

      <QuickEstimateForm />

      {manualOpen && <ManualIngestModal open={manualOpen} onClose={() => setManualOpen(false)} disabledReason={safeMode || demoMode ? "Disabled in safe/demo mode" : null} />}
      {rebuildOpen && <RebuildInsightsModal open={rebuildOpen} onClose={() => setRebuildOpen(false)} disabledReason={safeMode || demoMode ? "Disabled in safe/demo mode" : null} />}
      {feedbackOpen && <FeedbackModal open={feedbackOpen} onClose={() => setFeedbackOpen(false)} />}
    </div>
  );
}
