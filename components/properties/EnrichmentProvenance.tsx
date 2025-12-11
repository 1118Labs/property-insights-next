"use client";

import { useState } from "react";
import { PropertyProfile } from "@/lib/types";

type Enrichment = PropertyProfile["enrichment"];

export function EnrichmentProvenance({
  enrichment,
  property,
}: {
  enrichment?: Enrichment;
  property: PropertyProfile["property"];
}) {
  const [showRaw, setShowRaw] = useState(false);

  const enrichedFields = [
    { label: "Beds", value: property.beds },
    { label: "Baths", value: property.baths },
    { label: "Sqft", value: property.sqft },
    { label: "Lot Size", value: property.lotSizeSqft ? `${property.lotSizeSqft.toLocaleString()} sqft` : undefined },
    { label: "Year Built", value: property.yearBuilt },
    { label: "Latitude", value: property.address.latitude },
    { label: "Longitude", value: property.address.longitude },
  ].filter((field) => field.value !== undefined && field.value !== null);

  const provider = enrichment?.sources?.[0] || "Enrichment";
  const timestamp = enrichment?.meta?.providerDurations
    ? "Completed"
    : property.updatedAt || "Latest snapshot";

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500">Enrichment Provenance</p>
          <h2 className="text-base font-semibold text-gray-900">{provider}</h2>
          <p className="text-sm text-gray-600">{timestamp}</p>
        </div>
        <button
          type="button"
          onClick={() => setShowRaw((s) => !s)}
          className="rounded-full border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
        >
          {showRaw ? "Hide Raw Data" : "View Raw Data"}
        </button>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {enrichedFields.length ? (
          enrichedFields.map((field) => (
            <div key={field.label} className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm">
              <p className="text-xs uppercase tracking-wide text-gray-500">{field.label}</p>
              <p className="text-sm font-semibold text-gray-900">{String(field.value)}</p>
            </div>
          ))
        ) : (
          <p className="text-sm text-gray-600">No enrichment details available.</p>
        )}
      </div>

      {showRaw && (
        <div className="mt-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
          <pre className="max-h-80 overflow-auto p-4 text-xs text-gray-700">
            {JSON.stringify(enrichment ?? property, null, 2)}
          </pre>
        </div>
      )}
    </section>
  );
}
