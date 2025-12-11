import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { getMapSnapshot } from "@/lib/appleMaps";
import { PropertyProfile } from "@/lib/types";
import { PropertyHeader } from "@/components/properties/PropertyHeader";
import { PropertyStats } from "@/components/properties/PropertyStats";
import { MapPanel } from "@/components/properties/MapPanel";
import { EnrichmentProvenance } from "@/components/properties/EnrichmentProvenance";
import SectionHeader from "@/components/ui/SectionHeader";

async function fetchProfile(id: string): Promise<PropertyProfile | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/properties/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data as PropertyProfile;
}

export default async function PropertyDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const profile = await fetchProfile(params.id);
  if (!profile) return notFound();

  const addressLine = [
    profile.property.address.line1,
    profile.property.address.city,
    profile.property.address.province,
  ]
    .filter(Boolean)
    .join(", ");

  const estimatedValue = profile.insights?.valuation?.estimate ?? undefined;
  let lat = profile.property.address.latitude ?? undefined;
  let lng = profile.property.address.longitude ?? undefined;

  let mapImageUrl: string | null = null;
  if (lat !== undefined && lng !== undefined) {
    try {
      mapImageUrl = await getMapSnapshot(lat, lng);
    } catch (err) {
      console.error("Map snapshot failed", err);
    }
  } else {
    try {
      const enrichRes = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/property/enrich`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: addressLine }),
        cache: "no-store",
      });
      if (enrichRes.ok) {
        const body = await enrichRes.json();
        mapImageUrl = body?.mapImageUrl ?? null;
        const latNum = typeof body?.latitude === "number" ? body.latitude : lat;
        const lngNum = typeof body?.longitude === "number" ? body.longitude : lng;
        lat = latNum;
        lng = lngNum;
      }
    } catch (err) {
      console.error("Enrichment fetch for map failed", err);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-4 py-10 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <PropertyHeader property={profile.property} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <SectionHeader title="Overview" subtitle="Specs, map preview, and provenance" />
          <div className="flex flex-wrap gap-2">
            <Link
              href="/properties"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              ← Back
            </Link>
            <a
              href="/api/export/properties.csv"
              className="rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
            >
              Export CSV
            </a>
          </div>
        </div>

        <PropertyStats profile={profile} />

        <MapPanel latitude={lat} longitude={lng} mapImageUrl={mapImageUrl} />

        <EnrichmentProvenance enrichment={profile.enrichment} property={profile.property} />

        <PhotoPlaceholder />
      </div>
    </div>
  );
}
