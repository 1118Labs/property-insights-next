import Link from "next/link";
import { notFound } from "next/navigation";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { PropertyHeader } from "@/components/property/PropertyHeader";
import { PropertySpecs } from "@/components/property/PropertySpecs";
import { PropertyMap } from "@/components/property/PropertyMap";
import { getMapSnapshot } from "@/lib/appleMaps";
import { PropertyProfile } from "@/lib/types";

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
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-5 py-10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <PropertyHeader
            addressLine={addressLine}
            subtitle="Specs, map preview, and estimated value."
          />
          <div className="flex gap-2">
            <Link
              href="/properties"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              ← Back
            </Link>
            <a
              href="/api/export/properties.csv"
              className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              Export CSV
            </a>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="space-y-4">
            <PropertySpecs
              beds={profile.property.beds ?? undefined}
              baths={profile.property.baths ?? undefined}
              sqft={profile.property.sqft ?? undefined}
              lotSize={profile.property.lotSizeSqft ?? undefined}
              yearBuilt={profile.property.yearBuilt ?? undefined}
              estimatedValue={estimatedValue}
            />
          </div>

          <div className="space-y-4">
            <PropertyMap mapImageUrl={mapImageUrl || undefined} lat={lat} lng={lng} />
            <PhotoPlaceholder />
          </div>
        </div>
      </div>
    </div>
  );
}
