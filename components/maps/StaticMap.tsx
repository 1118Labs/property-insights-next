"use client";

import dynamic from "next/dynamic";

const LeafletMap = dynamic(() => import("./LeafletMap"), {
  ssr: false,
  loading: () => (
    <div className="flex h-48 w-full items-center justify-center rounded-2xl border border-white/40 bg-white/60 text-xs text-slate-500">
      Loading map…
    </div>
  ),
});

type StaticMapProps = {
  lat: number;
  lng: number;
  zoom?: number;
  className?: string;
};

export default function StaticMap({
  lat,
  lng,
  zoom = 15,
  className,
}: StaticMapProps) {
  return (
    <div
      className={`h-48 w-full overflow-hidden rounded-2xl border border-white/40 bg-white/70 shadow-inner shadow-[#021C36]/10 ${className ?? ""}`}
    >
      <LeafletMap lat={lat} lng={lng} zoom={zoom} />
    </div>
  );
}
