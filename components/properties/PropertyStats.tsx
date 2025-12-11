import { PropertyProfile } from "@/lib/types";

const formatNum = (value?: number | null) =>
  typeof value === "number" ? value.toLocaleString() : "—";

const statsConfig = [
  { label: "Beds", key: "beds" },
  { label: "Baths", key: "baths" },
  { label: "Square Feet", key: "sqft" },
  { label: "Lot Size", key: "lotSizeSqft" },
  { label: "Year Built", key: "yearBuilt" },
  { label: "Est. Rent", key: "estRent" },
  { label: "Est. Value", key: "estValue" },
  { label: "Property Type", key: "propertyType" },
] as const;

export function PropertyStats({ profile }: { profile: PropertyProfile }) {
  const property = profile.property;
  const insights = profile.insights;
  const values: Record<(typeof statsConfig)[number]["key"], string> = {
    beds: formatNum(property.beds ?? null),
    baths: formatNum(property.baths ?? null),
    sqft: formatNum(property.sqft ?? null),
    lotSizeSqft: property.lotSizeSqft ? `${formatNum(property.lotSizeSqft)} sqft` : "—",
    yearBuilt: property.yearBuilt ? `${property.yearBuilt}` : "—",
    estRent:
      insights?.rentEstimate?.estimate != null
        ? `$${formatNum(insights.rentEstimate.estimate)}`
        : "—",
    estValue:
      insights?.valuation?.estimate != null
        ? `$${formatNum(insights.valuation.estimate)}`
        : "—",
    propertyType:
      (property as { propertyType?: string }).propertyType ||
      property.lotShape ||
      insights?.taxonomy ||
      "—",
  };

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {statsConfig.map((stat) => (
          <div key={stat.key} className="rounded-lg border border-gray-200 bg-white px-3 py-3 shadow-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">{stat.label}</p>
            <p className="text-lg font-semibold text-gray-900">{values[stat.key]}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
