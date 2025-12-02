"use client";

import { useEffect, useState, FormEvent } from "react";
import { PropertyProfile } from "@/lib/types";
import { PropertyInsightCard } from "@/components/PropertyInsightCard";
import { StatsGrid } from "@/components/StatsGrid";
import { ScoreBadge } from "@/components/ScoreBadge";
import { formatAddress, normalizeAddress } from "@/lib/utils/address";
import { InfoTooltip } from "@/components/InfoTooltip";
import { logAnalyticsEvent } from "@/lib/utils/analytics";
import Link from "next/link";

type StatusResponse = {
  supabase: { configured: boolean; enabled: boolean };
  jobber: { configured: boolean; hasToken: boolean; tokenAge?: string; accountId?: string; tokenStatus?: string };
};

export default function Home() {
  const [address, setAddress] = useState("");
  const [profile, setProfile] = useState<PropertyProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [normalizedAddress, setNormalizedAddress] = useState<string>("");

  useEffect(() => {
    fetch("/api/status")
      .then(async (r) => setStatus(await r.json()))
      .catch(() => null);
    // Load a starter insight for demo
    (async () => {
      const res = await fetch("/api/property-insights", {
        method: "POST",
        body: JSON.stringify({ address: "123 Harbor Lane, Southold" }),
        headers: { "Content-Type": "application/json" },
      });
      const body = await res.json();
      setProfile(body.data);
      logAnalyticsEvent("insight_viewed", { source: "home_autoload" });
    })();
  }, []);

  const handleLookup = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/property-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body?.error || "Lookup failed");
      setProfile(body.data);
      const normalized = normalizeAddress({ line1: address });
      setNormalizedAddress(formatAddress(normalized) || address);
      logAnalyticsEvent("property_searched", { address });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Lookup failed");
    } finally {
      setLoading(false);
    }
  };

  const stats = [
    { label: "Operational Readiness", value: status?.jobber?.configured ? "Jobber wired" : "Jobber pending", helper: status?.jobber?.hasToken ? "Tokens saved" : "Connect to sync requests" },
    { label: "Data Persistence", value: status?.supabase?.configured ? "Supabase ready" : "Mock mode", helper: status?.supabase?.configured ? "Writing insights to DB" : "Using in-memory mock" },
    { label: "Coverage", value: profile ? `${profile.insights.riskFlags?.length || 0} risk flags` : "--", helper: "Auto scoring + recommendations" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50 text-slate-900">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-600 text-white font-bold">PI</div>
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-700">Property Insights</p>
            <p className="text-sm text-slate-600">Operate smarter. Quote faster.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 shadow">Demo data</span>
          )}
          {status?.jobber?.tokenStatus && (
            <div className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700 shadow">
              Token: {status.jobber.tokenStatus}
            </div>
          )}
        </div>
        <Link
          className="rounded-full border border-emerald-200 bg-white px-4 py-2 text-sm font-semibold text-emerald-700 shadow-sm hover:bg-emerald-50"
          href="/properties"
        >
          Open Dashboard →
        </Link>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="overflow-hidden rounded-3xl bg-white p-8 shadow-lg ring-1 ring-emerald-100">
          <div className="grid gap-8 lg:grid-cols-2">
            <div className="space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                Live MVP Stack • Next.js + Jobber + Supabase
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900">
                Turn service requests into instant property intelligence.
              </h1>
              <p className="text-lg text-slate-700">
                Connect Jobber, ingest requests, auto-score properties, and brief your crews with the context they need—without spreadsheets or manual prep.
              </p>

              <form onSubmit={handleLookup} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-4 shadow-inner">
              <label className="text-xs font-semibold uppercase tracking-wide text-slate-600">Quick property lookup</label>
                <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                  <div className="flex w-full flex-col gap-1">
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City"
                      className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100"
                    />
                    {normalizedAddress && (
                      <p className="text-xs text-emerald-700">Normalized: {normalizedAddress}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700 disabled:opacity-60"
                  >
                    {loading ? "Scoring..." : "Generate insights"}
                  </button>
                </div>
                {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
              </form>

              <StatsGrid stats={stats} />
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">What am I looking at?</p>
                <ul className="mt-2 space-y-1 text-sm text-slate-700">
                  <li>Scores combine livability, efficiency, and market strength. Lower risk improves the final score.</li>
                  <li>Risk flags highlight potential issues (age, size, missing geo). Use them as a checklist on-site.</li>
                  <li>Data sources: mock/demo providers unless connected to Zillow/RentCast; quality may vary in demo.</li>
                  <li className="text-xs text-emerald-700">
                    See docs: <a className="underline" href="/docs/known-limitations">Known limitations</a>
                  </li>
                </ul>
              </div>
            </div>

            <div className="relative">
              <div className="absolute right-8 top-0 h-32 w-32 rounded-full bg-emerald-100 blur-3xl" />
              <div className="absolute left-4 bottom-10 h-24 w-24 rounded-full bg-amber-100 blur-3xl" />
              <div className="relative rounded-3xl border border-slate-100 bg-white/90 p-4 shadow-xl backdrop-blur">
                <p className="text-xs uppercase tracking-wide text-slate-500">Live Preview</p>
                {profile ? (
                  <div className="mt-3 space-y-3">
                    <ScoreBadge score={profile.insights.score} label="Overall" />
                    <div className="grid grid-cols-2 gap-3 text-sm text-slate-700">
                      <Metric label="Valuation" tooltip="Heuristic estimate based on size/age" value={profile.insights.valuation?.estimate ? `$${profile.insights.valuation.estimate.toLocaleString()}` : "Pending"} helper="Heuristic" />
                      <Metric label="Rent" tooltip="Estimate based on comparable size/beds" value={profile.insights.rentEstimate?.estimate ? `$${profile.insights.rentEstimate.estimate.toLocaleString()}` : "Pending"} helper="Est." />
                      <Metric label="Livability" tooltip="Layout, beds, baths balance" value={`${Math.round(profile.insights.breakdown.livability)}/100`} helper="Space & layout" />
                      <Metric label="Risk" tooltip="Higher means more potential issues" value={`${Math.round(profile.insights.breakdown.risk)}/100`} helper="Lower is better" />
                    </div>
                    <p className="rounded-2xl bg-slate-50 p-3 text-sm text-slate-700">{profile.insights.summary}</p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-slate-600">Run a lookup to see instant insights.</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {profile && (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-slate-900">Latest Insight</h2>
              <Link className="text-sm font-semibold text-emerald-700 hover:text-emerald-800" href="/properties">
                View all properties →
              </Link>
            </div>
            <div className="mt-4">
              <PropertyInsightCard profile={profile} />
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

function Metric({ label, value, helper, tooltip }: { label: string; value: string; helper?: string; tooltip?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">
        {label} <InfoTooltip label={tooltip || label} />
      </p>
      <p className="text-lg font-semibold text-slate-900">{value}</p>
      {helper && <p className="text-[11px] text-slate-500">{helper}</p>}
    </div>
  );
}
