"use client";

import { useCallback, useEffect, useState } from "react";
import { PropertyProfile } from "@/lib/types";
import { ScoreBadge } from "./ScoreBadge";
import { RiskPills } from "./RiskPills";
import clsx from "clsx";

type Props = { profile: PropertyProfile; loading?: boolean; variant?: "default" | "compare" };
const fallbackImages = [
  "https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=600&q=60",
  "https://images.unsplash.com/photo-1449158743715-0a90ebb6d2d8?auto=format&fit=crop&w=600&q=60",
  "https://images.unsplash.com/photo-1600585154340-0ef3c08f05c7?auto=format&fit=crop&w=600&q=60",
];

export function PropertyInsightCard({ profile, loading = false, variant = "default" }: Props) {
  const { property, insights } = profile;
  const addr = property.address;
  const images = property.images && property.images.length ? property.images : fallbackImages;
  const hasWarnings = insights.riskFlags?.length > 0;
  const compact = variant === "compare";
  const provenance = profile.enrichment;
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const healthLabel =
    insights.score >= 80 ? "Healthy" : insights.score >= 60 ? "Needs Review" : "High-Risk";
  const stale =
    profile.property.updatedAt &&
    new Date().getTime() - new Date(profile.property.updatedAt).getTime() > 7 * 24 * 60 * 60 * 1000;

  const openLightbox = (idx: number) => {
    setActiveIndex(idx);
    setLightboxOpen(true);
  };
  const closeLightbox = () => setLightboxOpen(false);
  const next = useCallback(() => setActiveIndex((i) => (i + 1) % images.length), [images.length]);
  const prev = useCallback(() => setActiveIndex((i) => (i - 1 + images.length) % images.length), [images.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxOpen, next, prev]);
  const details = [
    { label: "Address", value: [addr.line1, addr.line2, addr.city, addr.province, addr.postalCode].filter(Boolean).join(", ") || "Unknown" },
    { label: "Country", value: addr.country || "Unknown" },
    { label: "Jobber ID", value: property.jobberPropertyId || "—" },
  ];

  return (
    <div className={compact ? "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"}>
      <div className="mb-2 flex items-center justify-between">
        <span className={clsx("rounded-full px-3 py-1 text-xs font-semibold", healthLabel === "Healthy" ? "bg-emerald-100 text-emerald-800" : healthLabel === "Needs Review" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800")}>
          {healthLabel}
        </span>
        <ScoreBadge score={insights.score} isLoading={loading} />
      </div>
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Property</p>
          <h3 className="text-lg font-semibold text-slate-900">
            {loading ? <span className="inline-block h-5 w-40 animate-pulse rounded bg-slate-200" /> : ([addr.line1, addr.city].filter(Boolean).join(", ") || "Unknown")}
          </h3>
          {stale && <p className="text-[11px] text-amber-700">Data may be stale</p>}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4">
        <Stat label="Beds" value={property.beds ?? "-"} loading={loading} />
        <Stat label="Baths" value={property.baths ?? "-"} loading={loading} />
        <Stat label="Sqft" value={property.sqft ? property.sqft.toLocaleString() : "-"} loading={loading} />
        <Stat label="Year" value={property.yearBuilt ?? "-"} loading={loading} />
      </div>

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Insight</p>
        <p className="mt-1 text-slate-700">
          {loading ? <span className="inline-block h-4 w-60 animate-pulse rounded bg-slate-200" /> : insights.summary}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Livability" value={`${Math.round(insights.breakdown.livability)} / 100`} subtle loading={loading} />
          <Stat label="Efficiency" value={`${Math.round(insights.breakdown.efficiency)} / 100`} subtle loading={loading} />
          <Stat label="Market" value={`${Math.round(insights.breakdown.marketStrength)} / 100`} subtle loading={loading} />
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
          <Stat label="Lot appeal" value={`${Math.round(insights.breakdown.lotAppeal || 0)} / 100`} subtle loading={loading} />
          <Stat label="Age factor" value={`${Math.round(insights.breakdown.ageFactor || 0)} / 100`} subtle loading={loading} />
          <Stat label="Equity delta" value={`${Math.round(insights.breakdown.equityDelta || 0)} / 100`} subtle loading={loading} />
        </div>
      </div>

      {hasWarnings ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Risks</p>
          {loading ? <div className="h-6 w-48 animate-pulse rounded-full bg-slate-200" /> : <RiskPills flags={insights.riskFlags} />}
        </div>
      ) : null}

      {!compact && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gallery</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.slice(0, 3).map((src, idx) => (
              <div key={src + idx} className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {loading ? (
                  <div className="h-full w-full animate-pulse bg-slate-200" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={src} alt="Property" className="h-full w-full cursor-zoom-in object-cover transition hover:scale-105" onClick={() => openLightbox(idx)} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {!compact && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Map (stub)</p>
          <div className="mt-2 overflow-hidden rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 via-slate-100 to-slate-200 p-4 text-slate-700">
            {loading ? (
              <div className="h-32 w-full animate-pulse rounded bg-slate-200" />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-lg">🗺️</div>
                <div className="text-sm">
                  <p className="font-semibold text-slate-900">{[addr.line1, addr.city].filter(Boolean).join(", ") || "Unknown address"}</p>
                  <p className="text-xs text-slate-600">Map preview placeholder. Hook up Leaflet/Maps SDK when creds available.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {profile.requests?.length ? (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Recent Requests</p>
          <ul className="mt-2 space-y-2 text-sm">
            {profile.requests.slice(0, 3).map((req) => (
              <li
                key={req.id || req.jobberRequestId}
                className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2"
              >
                <div>
                  <p className="font-medium text-slate-900">{loading ? "Loading..." : req.title || "Request"}</p>
                  <p className="text-xs text-slate-600">{loading ? "" : req.description || req.status}</p>
                </div>
                <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  {loading ? "…" : req.status || "Unknown"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!compact && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Timeline</p>
          {loading ? (
            <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">History placeholder</p>
              <p className="text-xs text-slate-600">Surface property visits, quotes, permits, and scoring changes here.</p>
            </div>
          )}
        </div>
      )}

      {!compact && (
        <div className="mt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Provenance</p>
          {loading ? (
            <div className="h-10 w-full animate-pulse rounded bg-slate-200" />
          ) : provenance ? (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <p className="font-semibold text-slate-900">Sources: {provenance.sources?.join(", ") || "Unknown"}</p>
              {provenance.meta?.qualityScore !== undefined && (
                <p className="text-xs text-slate-600">Quality score: {Math.round(provenance.meta.qualityScore)}%</p>
              )}
              {provenance.errors?.length ? (
                <ul className="mt-2 list-disc pl-5 text-xs text-rose-600">
                  {provenance.errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              ) : provenance.meta?.providerErrors ? (
                <ul className="mt-2 list-disc pl-5 text-xs text-rose-600">
                  {Object.entries(provenance.meta.providerErrors).map(([k, v]) => (
                    <li key={k}>{k}: {v}</li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-emerald-700">No enrichment errors.</p>
              )}
            </div>
          ) : (
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">No provenance available.</div>
          )}
        </div>
      )}

      {!compact && (
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500">
            Normalized details
          </summary>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {details.map((d) => (
              <div key={d.label} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs">
                <p className="text-slate-500">{d.label}</p>
                <p className="font-semibold text-slate-900">{d.value}</p>
              </div>
            ))}
          </div>
        </details>
      )}

      {lightboxOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4">
          <div className="relative w-full max-w-4xl">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={images[activeIndex]} alt="Full" className="mx-auto max-h-[80vh] w-auto rounded-xl shadow-2xl" />
            <button onClick={closeLightbox} className="absolute right-2 top-2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 shadow">Close</button>
            <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 shadow">←</button>
            <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80 px-3 py-1 text-xs font-semibold text-slate-800 shadow">→</button>
          </div>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, subtle, loading }: { label: string; value: string | number; subtle?: boolean; loading?: boolean }) {
  return (
    <div className="flex flex-col">
      <span className="text-xs uppercase tracking-wide text-slate-500">{label}</span>
      {loading ? (
        <span className="mt-1 h-4 w-12 animate-pulse rounded bg-slate-200" />
      ) : (
        <span className={subtle ? "font-semibold text-slate-800" : "text-base font-semibold text-slate-900"}>{value}</span>
      )}
    </div>
  );
}
