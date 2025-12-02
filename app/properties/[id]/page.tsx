import Link from "next/link";
import { notFound } from "next/navigation";
import { PropertyInsightCard } from "@/components/PropertyInsightCard";
import { PropertyProvenancePanel } from "@/components/PropertyProvenancePanel";
import { PropertyHistoryPanel } from "@/components/PropertyHistoryPanel";
import { RiskFactorBreakdown } from "@/components/RiskFactorBreakdown";
import { StaticMapPreview } from "@/components/StaticMapPreview";
import { PhotoPlaceholder } from "@/components/PhotoPlaceholder";
import { QuoteGenerator } from "@/components/QuoteGenerator";
import { PropertyProfile } from "@/lib/types";

async function fetchProfile(id: string): Promise<PropertyProfile | null> {
  const base = process.env.NEXT_PUBLIC_APP_URL || "";
  const res = await fetch(`${base}/api/properties/${id}`, { cache: "no-store" });
  if (!res.ok) return null;
  const body = await res.json();
  return body.data as PropertyProfile;
}

export default async function PropertyDetailPage({ params }: { params: { id: string } }) {
  const profile = await fetchProfile(params.id);
  if (!profile) return notFound();

  const addressLine = [profile.property.address.line1, profile.property.address.city, profile.property.address.province].filter(Boolean).join(", ");

  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-slate-100 px-6 py-10 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Property detail</p>
            <h1 className="text-3xl font-semibold text-slate-900 dark:text-white">{addressLine || "Property"}</h1>
            <p className="text-sm text-slate-600 dark:text-slate-300">Enrichment provenance, history, and risk breakdown.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/properties" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">← Back</Link>
            <a href="/api/export/properties.csv" className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">Export CSV</a>
          </div>
        </div>

        <QuoteGenerator propertyId={profile.property.id || ""} defaultProfile={profile.insights.serviceProfile || "cleaning"} />

        <PropertyInsightCard profile={profile} />

        <div className="grid gap-4 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-3">
            <PropertyProvenancePanel profile={profile} />
            <RiskFactorBreakdown breakdown={profile.insights.breakdown} flags={profile.insights.riskFlags} />
            {profile.insights.riskFlags.some((f) => f.severity === "high") && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800 dark:border-rose-800 dark:bg-rose-900/40 dark:text-rose-100">
                <p className="text-xs font-semibold uppercase tracking-wide">Why flagged?</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                  {profile.insights.riskFlags.map((f) => (
                    <li key={f.code}>
                      <span className="font-semibold">{f.label}</span>{f.detail ? ` — ${f.detail}` : ""}
                    </li>
                  ))}
                  <li>Scores weighted by livability, efficiency, and market strength; older homes or small lots may be penalized.</li>
                  <li>Data caveats: provider coverage may vary; validate critical numbers before quoting.</li>
                </ul>
              </div>
            )}
          </div>
          <PropertyHistoryPanel profile={profile} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <StaticMapPreview address={addressLine} highlight="Property" />
          <PhotoPlaceholder />
        </div>
      </div>
    </div>
  );
}
