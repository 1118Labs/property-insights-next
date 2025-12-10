import { PropertyInsightCard } from "@/components/PropertyInsightCard";
import { StatsGrid } from "@/components/StatsGrid";
import { PropertyProfile } from "@/lib/types";
import Link from "next/link";
import PISection from "@/components/ui/PISection";
import Image from "next/image";
import PIButton from "@/components/ui/PIButton";
import PICard from "@/components/ui/PICard";

export const dynamic = "force-dynamic";

async function fetchProperties() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/properties`, {
    cache: "no-store",
  });
  if (!res.ok) return { profiles: [], summary: { total: 0 } };
  const body = await res.json();
  const items = (body.data?.items as PropertyProfile[]) || (body.data as PropertyProfile[]) || [];
  const summary = body.data?.summary || body.summary || { total: items.length };
  return { profiles: items, summary };
}

export default async function PropertiesPage() {
  const { profiles, summary } = await fetchProperties();
  const sortedProfiles = profiles; // placeholder for future server-side sorting
  const values = profiles
    .map((p) => p.insights?.valuation?.estimate)
    .filter((v): v is number => typeof v === "number" && !Number.isNaN(v));
  const avgValue = values.length ? Math.round(values.reduce((a, b) => a + b, 0) / values.length) : null;

  const stats = [
    { label: "Tracked properties", value: summary?.total ?? profiles.length },
    { label: "Avg estimated value", value: avgValue ? `$${avgValue.toLocaleString()}` : "—" },
    { label: "Requests attached", value: profiles.reduce((acc, p) => acc + (p.requests?.length ?? 0), 0) },
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-10 md:px-10">
        <div>
          <p className="text-sm font-semibold text-slate-600">Portfolio</p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Properties & enrichment</h1>
          <p className="text-sm text-slate-600">Live view of recently ingested properties and their core specs.</p>
        </div>
        <div className="flex gap-2">
          <PIButton variant="secondary" href="/" className="px-5 py-3 text-sm">
            ← Back
          </PIButton>
          <PIButton href="/admin/property-test" className="px-5 py-3 text-sm">
            Sync from Jobber
          </PIButton>
        </div>
      </div>

      <div className="mx-auto max-w-7xl space-y-8 px-6 pb-10 md:px-10">
        <Image src="/brand/pi-logo.png" alt="Property Insights Logo" width={42} height={42} className="h-8 w-auto opacity-90" />

        <PISection title="Filters (mock)">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Beds" aria-label="Beds filter" />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Baths" aria-label="Baths filter" />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Min sqft" aria-label="Min sqft filter" />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Max sqft" aria-label="Max sqft filter" />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Min lot" aria-label="Min lot filter" />
            <input className="rounded-lg border border-gray-200 px-3 py-2 text-sm" placeholder="Max lot" aria-label="Max lot filter" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-700">
            <span className="font-semibold">Sort by:</span>
            <PIButton variant="secondary" className="px-3 py-1 text-xs">
              Value
            </PIButton>
            <PIButton variant="secondary" className="px-3 py-1 text-xs">
              Updated
            </PIButton>
            <PIButton variant="secondary" className="px-3 py-1 text-xs">
              Beds
            </PIButton>
          </div>
          <p className="mt-2 text-xs text-slate-500">No results? Adjust filters or run an ingest in admin. Filters are placeholders today.</p>
        </PISection>

        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {profiles.length === 0 ? (
            <PICard className="border-dashed text-slate-600">
              <p className="font-semibold text-slate-900">No properties yet</p>
              <p className="text-sm text-slate-600">If your Jobber account has zero properties/clients, connect and run ingestion after creating data. Demo mode will only show sample data.</p>
              <div className="mt-3 flex gap-2">
                <PIButton variant="secondary" href="/admin" className="px-5 py-3 text-sm">
                  Admin
                </PIButton>
                <PIButton href="/admin/property-test" className="px-5 py-3 text-sm">
                  Test ingestion
                </PIButton>
              </div>
            </PICard>
          ) : (
            sortedProfiles.map((profile) => (
              <div key={profile.property.id || profile.property.address.line1} className="grid grid-cols-1 gap-2">
                <PropertyInsightCard profile={profile} />
                {profile.property.id && (
                  <PIButton variant="secondary" href={`/properties/${profile.property.id}`} className="w-fit px-3 py-1 text-xs">
                    View details →
                  </PIButton>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
