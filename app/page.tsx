"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, FormEvent } from "react";
import { PropertyProfile } from "@/lib/types";
import { PropertyInsightCard } from "@/components/PropertyInsightCard";
import { StatsGrid } from "@/components/StatsGrid";
import { formatAddress, normalizeAddress } from "@/lib/utils/address";
import { logAnalyticsEvent } from "@/lib/utils/analytics";
import PIButton from "@/components/ui/PIButton";
import PICard from "@/components/ui/PICard";

type JobberStatus = {
  connected?: boolean;
};

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
  const [jobberStatus, setJobberStatus] = useState<"loading" | "connected" | "disconnected">("loading");

  useEffect(() => {
    fetch("/api/status")
      .then(async (r) => setStatus(await r.json()))
      .catch(() => null);
    fetch("/api/jobber/status")
      .then(async (r) => {
        const json = (await r.json()) as JobberStatus;
        setJobberStatus(json.connected ? "connected" : "disconnected");
      })
      .catch(() => setJobberStatus("disconnected"));
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
    {
      label: "Operational Readiness",
      value: status?.jobber?.configured ? "Jobber wired" : "Jobber pending",
      helper: status?.jobber?.hasToken ? "Tokens saved" : "Connect to sync requests",
    },
    {
      label: "Data Persistence",
      value: status?.supabase?.configured ? "Supabase ready" : "Mock mode",
      helper: status?.supabase?.configured ? "Writing enrichment to DB" : "Using in-memory mock",
    },
    {
      label: "Latest estimate",
      value: profile?.insights?.valuation?.estimate
        ? `$${profile.insights.valuation.estimate.toLocaleString()}`
        : "Pending",
      helper: "RentCast-powered enrichment",
    },
  ];

  return (
    <div className="min-h-screen bg-[#F5F5F7] text-[#0B1220]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white ring-1 ring-[#E3E4EA]">
            <Image src="/brand/pi-logo.png" alt="Property Insights" width={32} height={32} />
          </div>
          <div>
            <p className="text-xs uppercase tracking-wide text-[#6B7280]">Property Insights</p>
            <p className="text-sm text-[#4B5563]">Operate smarter. Quote faster.</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {process.env.NEXT_PUBLIC_DEMO_MODE === "true" && (
            <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#021C36] ring-1 ring-[#E3E4EA]">
              Demo data
            </span>
          )}
          {status?.jobber?.tokenStatus && (
            <div className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#021C36] ring-1 ring-[#E3E4EA]">
              Token: {status.jobber.tokenStatus}
            </div>
          )}
        </div>
        <PIButton variant="secondary" href="/properties" className="rounded-full px-5 py-2 text-sm">
          Open Dashboard →
        </PIButton>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-16">
        <div className="mb-4 flex justify-start">
          <span
            className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold shadow-sm ring-1 ring-[#E3E4EA] ${
              jobberStatus === "connected"
                ? "bg-white text-[#021C36]"
                : "bg-white text-[#6B7280]"
            }`}
          >
            <span
              className={`h-2 w-2 rounded-full ${
                jobberStatus === "connected" ? "bg-[#16A34A]" : "bg-[#D1D5DB]"
              }`}
            />
            {jobberStatus === "loading"
              ? "Checking Jobber…"
              : jobberStatus === "connected"
              ? "Jobber connected"
              : "Jobber not connected"}
          </span>
        </div>
        <PICard className="overflow-hidden rounded-[24px] border border-[#E3E4EA] p-8">
          <div className="grid gap-10 lg:grid-cols-2">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#021C36] ring-1 ring-[#E3E4EA]">
                Live Stack • Next.js + Jobber + Supabase
              </div>
              <h1 className="text-4xl font-semibold leading-tight tracking-tight text-[#0B1220]">
                Turn service requests into instant property intel.
              </h1>
              <p className="text-lg text-[#4B5563]">
                Connect Jobber, enrich properties with RentCast, and brief your crews with the basics—beds, baths, square footage, lot size, and value—without spreadsheets or manual prep.
              </p>

              <form onSubmit={handleLookup} className="rounded-[20px] border border-[#E3E4EA] bg-[#F9FAFB] p-4 shadow-inner">
                <label className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Quick property lookup</label>
                <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                  <div className="flex w-full flex-col gap-1">
                    <input
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="123 Main St, City"
                      className="w-full rounded-[14px] border border-[#E3E4EA] bg-white px-4 py-3 text-sm text-[#0B1220] focus:border-[#14D8FF] focus:outline-none focus:ring-2 focus:ring-[#14D8FF]/20"
                    />
                    {normalizedAddress && (
                      <p className="text-xs text-[#021C36]">Normalized: {normalizedAddress}</p>
                    )}
                  </div>
                  <PIButton type="submit" disabled={loading} className="rounded-full px-5 py-3 text-sm disabled:opacity-60">
                    {loading ? "Enriching..." : "Generate insights"}
                  </PIButton>
                  <PIButton
                    type="button"
                    variant="secondary"
                    onClick={() => {
                      window.location.href = "/dashboard/jobber";
                    }}
                    className="rounded-full px-5 py-3 text-sm"
                  >
                    Connect Jobber
                  </PIButton>
                </div>
                {error && <p className="mt-2 text-sm text-rose-600">{error}</p>}
              </form>

              <StatsGrid stats={stats} />
              <PICard className="rounded-[20px] border border-[#E3E4EA] p-5">
                <p className="text-sm font-semibold text-[#0B1220]">What am I looking at?</p>
                <ul className="mt-3 space-y-2 text-sm text-[#4B5563]">
                  <li>We enrich each address with beds, baths, square footage, lot size, year built, and estimated value.</li>
                  <li>RentCast powers the default enrichment; Zillow can be layered in when available.</li>
                  <li>No livability scores or risk heuristics—just contractor-ready specs you can trust.</li>
                  <li className="text-xs text-[#021C36]">
                    See docs: <a className="underline" href="/docs/known-limitations">Known limitations</a>
                  </li>
                </ul>
              </PICard>
            </div>

            <div className="relative">
              <PICard className="relative rounded-[24px] border border-[#E3E4EA] p-5">
                <p className="text-xs uppercase tracking-wide text-[#6B7280]">Live Preview</p>
                {profile ? (
                  <div className="mt-3 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-[#6B7280]">Address</p>
                      <p className="text-lg font-semibold text-[#021C36]">
                        {formatAddress(profile.property.address)}
                      </p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm text-[#4B5563]">
                      <Metric label="Beds" value={profile.property.beds ?? "—"} />
                      <Metric label="Baths" value={profile.property.baths ?? "—"} />
                      <Metric label="Sqft" value={profile.property.sqft?.toLocaleString() ?? "—"} />
                      <Metric
                        label="Lot"
                        value={profile.property.lotSizeSqft ? `${profile.property.lotSizeSqft.toLocaleString()} sqft` : "—"}
                      />
                      <Metric label="Year built" value={profile.property.yearBuilt ?? "—"} />
                      <Metric
                        label="Estimated value"
                        value={
                          profile.insights.valuation?.estimate
                            ? `$${profile.insights.valuation.estimate.toLocaleString()}`
                            : "Pending"
                        }
                      />
                    </div>
                    <p className="rounded-[16px] bg-[#F5F5F7] p-3 text-sm text-[#4B5563]">
                      {profile.insights.summary}
                    </p>
                  </div>
                ) : (
                  <p className="mt-4 text-sm text-[#6B7280]">Run a lookup to see instant insights.</p>
                )}
              </PICard>
            </div>
          </div>
        </PICard>

        {profile && (
          <section className="mt-10">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-[#0B1220]">Latest Insight</h2>
              <Link className="text-sm font-semibold text-[#021C36] hover:underline" href="/properties">
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

function Metric({ label, value, helper }: { label: string; value: string | number; helper?: string }) {
  return (
    <div className="rounded-[14px] border border-[#E3E4EA] bg-white px-3 py-2 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-[#6B7280]">{label}</p>
      <p className="text-lg font-semibold text-[#021C36]">{value}</p>
      {helper && <p className="text-[11px] text-[#6B7280]">{helper}</p>}
    </div>
  );
}
