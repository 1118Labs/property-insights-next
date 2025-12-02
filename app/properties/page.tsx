import { PropertyInsightCard } from "@/components/PropertyInsightCard";
import { StatsGrid } from "@/components/StatsGrid";
import { PropertyProfile } from "@/lib/types";
import Link from "next/link";

export const dynamic = "force-dynamic";

async function fetchProperties() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/properties`, {
    cache: "no-store",
  });
  if (!res.ok) return { profiles: [], summary: { total: 0, avgScore: 0, highRisk: 0 } };
  const body = await res.json();
  return { profiles: (body.data as PropertyProfile[]) || [], summary: body.summary };
}

export default async function PropertiesPage() {
  const { profiles, summary } = await fetchProperties();
  const sortedProfiles = profiles; // placeholder for future server-side sorting

  const stats = [
    { label: "Tracked properties", value: summary?.total ?? profiles.length },
    { label: "Avg score", value: summary?.avgScore ?? "--" },
    { label: "High risk", value: summary?.highRisk ?? 0 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-6 py-10">
      <div className="mx-auto flex max-w-6xl items-center justify-between pb-6">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-700">Portfolio</p>
          <h1 className="text-3xl font-semibold text-slate-900">Properties & insights</h1>
          <p className="text-sm text-slate-600">Live view of recently ingested properties and their scores.</p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">← Back</Link>
          <Link
            href="/admin/property-test"
            className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-lg shadow-emerald-200 hover:bg-emerald-700"
          >
            Sync from Jobber
          </Link>
        </div>
      </div>

      <div className="mx-auto max-w-6xl space-y-6">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">Filters (mock)</p>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Beds" aria-label="Beds filter" />
            <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Baths" aria-label="Baths filter" />
            <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Min sqft" aria-label="Min sqft filter" />
            <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Max sqft" aria-label="Max sqft filter" />
            <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Min lot" aria-label="Min lot filter" />
            <input className="rounded-lg border border-slate-200 px-3 py-2 text-sm" placeholder="Max lot" aria-label="Max lot filter" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
            <span className="font-semibold text-slate-700">Sort by:</span>
            <button className="rounded-full border border-slate-200 px-2 py-1">Score</button>
            <button className="rounded-full border border-slate-200 px-2 py-1">Updated</button>
            <button className="rounded-full border border-slate-200 px-2 py-1">Risk</button>
          </div>
          <p className="mt-2 text-xs text-slate-500">No results? Adjust filters or run an ingest in admin. Filters are placeholders today.</p>
        </div>

        <StatsGrid stats={stats} />

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {profiles.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-slate-600">
              <p className="font-semibold text-slate-900">No properties yet</p>
              <p className="text-sm text-slate-600">If your Jobber account has zero properties/clients, connect and run ingestion after creating data. Demo mode will only show sample data.</p>
              <div className="mt-3 flex gap-2">
                <Link href="/admin" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow">Admin</Link>
                <Link href="/admin/property-test" className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow shadow-emerald-200">Test ingestion</Link>
              </div>
            </div>
          ) : (
            sortedProfiles.map((profile) => (
              <div key={profile.property.id || profile.property.address.line1} className="grid grid-cols-1 gap-2">
                <PropertyInsightCard profile={profile} />
                {profile.property.id && (
                  <Link href={`/properties/${profile.property.id}`} className="inline-flex w-fit items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50">
                    View details →
                  </Link>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
