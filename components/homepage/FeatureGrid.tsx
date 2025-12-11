const features = [
  {
    title: "AI Property Insights",
    body: "Beds, baths, square footage, lot size, valuation, and livability basics surfaced instantly.",
  },
  {
    title: "Aerial & Satellite Analysis",
    body: "Roof, lot, and driveway cues in a clean, readable format for crews and clients.",
  },
  {
    title: "Jobber Sync",
    body: "Pull properties and requests directly from Jobber with one click — no CSVs or uploads.",
  },
  {
    title: "Client Quotes",
    body: "Generate client-ready quotes with clear itemization and optional add-ons.",
  },
  {
    title: "Service Routing Optimization",
    body: "Plan routes and schedules with property context baked in for your field teams.",
  },
  {
    title: "Property Profiles",
    body: "Keep a living profile for every property with history, notes, and insight provenance.",
  },
];

export function FeatureGrid() {
  return (
    <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {features.map((feature) => (
        <div
          key={feature.title}
          className="space-y-2 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md"
        >
          <h3 className="text-base font-semibold text-gray-900">{feature.title}</h3>
          <p className="text-sm text-gray-600">{feature.body}</p>
        </div>
      ))}
    </section>
  );
}
