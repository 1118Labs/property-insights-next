"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const InteractiveMap = dynamic(() => import("./InteractiveMap"), { ssr: false });

type MapPanelProps = {
  latitude?: number;
  longitude?: number;
  mapImageUrl?: string | null;
};

export function MapPanel({ latitude, longitude, mapImageUrl }: MapPanelProps) {
  const [tab, setTab] = useState<"interactive" | "satellite">(
    latitude && longitude ? "interactive" : "satellite"
  );

  const hasCoords = typeof latitude === "number" && typeof longitude === "number";
  const hasImage = Boolean(mapImageUrl);

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500">Map</p>
          <p className="text-sm text-gray-700">Interactive and satellite previews</p>
        </div>
        <div className="flex overflow-hidden rounded-full border border-gray-200 text-sm">
          <button
            type="button"
            onClick={() => setTab("interactive")}
            className={`px-3 py-1 transition-all duration-200 ${
              tab === "interactive" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
            }`}
            disabled={!hasCoords}
          >
            Interactive Map
          </button>
          <button
            type="button"
            onClick={() => setTab("satellite")}
            className={`px-3 py-1 transition-all duration-200 ${
              tab === "satellite" ? "bg-gray-100 text-gray-900" : "text-gray-600 hover:bg-gray-50"
            }`}
            disabled={!hasImage}
          >
            Satellite Preview
          </button>
        </div>
      </div>

      <div className="mt-4">
        {tab === "interactive" && hasCoords ? (
          <InteractiveMap lat={latitude as number} lng={longitude as number} />
        ) : null}

        {tab === "satellite" && hasImage ? (
          <div className="overflow-hidden rounded-lg border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={mapImageUrl as string}
              alt="Satellite preview"
              className="h-72 w-full object-cover"
              loading="lazy"
            />
          </div>
        ) : null}

        {!hasCoords && !hasImage && (
          <div className="rounded-lg border border-dashed border-gray-200 bg-gray-50 p-6 text-center text-sm text-gray-600">
            Map preview unavailable for this property.
          </div>
        )}
      </div>
    </section>
  );
}
