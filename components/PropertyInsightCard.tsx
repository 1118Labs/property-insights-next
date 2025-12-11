"use client";

import { useCallback, useEffect, useState } from "react";
import { PropertyProfile } from "@/lib/types";
import { deriveEnrichedFields, formatAddressDisplay } from "@/lib/propertyDisplay";

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
  const compact = variant === "compare";
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

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

  const estimatedValue = insights?.valuation?.estimate;
  const summary = insights?.summary || "Property enrichment ready for crews.";
  const addressLabel = formatAddressDisplay(addr);
  const { beds, baths, sqft, lot, year, estValue, estRent, hasLimitedData } = deriveEnrichedFields(profile);

  return (
    <div className={compact ? "rounded-2xl border border-slate-200 bg-white p-4 shadow-sm" : "rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"}>
      <div className="mb-2 flex items-center justify-between">
        <span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
          Enriched
        </span>
        {property.jobberPropertyId && (
          <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-slate-600">
            Jobber {property.jobberPropertyId}
          </span>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Property</p>
          <h3 className="text-lg font-semibold text-slate-900">
            {loading ? (
              <span className="inline-block h-5 w-40 animate-pulse rounded bg-slate-200" />
            ) : (
              addressLabel
            )}
          </h3>
          {property.updatedAt && (
            <p className="text-[11px] text-slate-500">Updated {new Date(property.updatedAt).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-slate-700 sm:grid-cols-4">
        <Stat label="Beds" value={beds} loading={loading} />
        <Stat label="Baths" value={baths} loading={loading} />
        <Stat label="Sqft" value={sqft} loading={loading} />
        <Stat label="Lot" value={lot} loading={loading} />
        <Stat label="Year" value={year} loading={loading} />
        <Stat label="Estimated value" value={estValue} loading={loading} />
        <Stat label="Estimated rent" value={estRent} loading={loading} />
      </div>
      {hasLimitedData && (
        <p className="text-xs text-slate-500">Limited data — estimate only.</p>
      )}

      <div className="mt-4 rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
        <p className="font-semibold text-slate-900">Property notes</p>
        <p className="mt-1 text-slate-700">
          {loading ? <span className="inline-block h-4 w-60 animate-pulse rounded bg-slate-200" /> : summary}
        </p>
      </div>

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
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Gallery</p>
          <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
            {images.slice(0, 3).map((src, idx) => (
              <div key={src + idx} className="aspect-video overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
                {loading ? (
                  <div className="h-full w-full animate-pulse bg-slate-200" />
                ) : (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={src}
                    alt="Property"
                    className="h-full w-full cursor-zoom-in object-cover transition hover:scale-105"
                    onClick={() => openLightbox(idx)}
                  />
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
              <div className="text-sm">
                <p className="font-semibold text-slate-900">
                  {[addr.line1, addr.city].filter(Boolean).join(", ") || "Unknown address"}
                </p>
                <p className="text-xs text-slate-600">
                  Map preview placeholder. Hook up maps provider when credentials are ready.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {!compact && (
        <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3">
          <summary className="cursor-pointer text-xs font-semibold uppercase tracking-wide text-slate-500">
            Normalized details
          </summary>
          <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
            {[
              { label: "Address", value: [addr.line1, addr.line2, addr.city, addr.province, addr.postalCode].filter(Boolean).join(", ") || "Unknown" },
              { label: "Country", value: addr.country || "Unknown" },
              { label: "Jobber ID", value: property.jobberPropertyId || "—" },
            ].map((d) => (
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

function Stat({ label, value, subtle = false, loading = false }: { label: string; value: string | number; subtle?: boolean; loading?: boolean }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] uppercase tracking-wide text-slate-500">{label}</p>
      {loading ? (
        <div className="h-5 w-20 animate-pulse rounded bg-slate-200" />
      ) : (
        <p className={`text-base font-semibold text-slate-900 ${subtle ? "text-slate-700" : ""}`}>{value}</p>
      )}
    </div>
  );
}
