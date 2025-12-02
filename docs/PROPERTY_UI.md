# UI Components & Workflows

## Components
- `PropertyInsightCard`: Displays property summary, scores, risks, gallery, map stub, timeline placeholder, and normalized details. Props: `{ profile, loading?, variant?: "default" | "compare" }`.
- `ScoreBadge`: Shows score and quality tiers (High/Medium/Low). Props: `{ score, label?, isLoading? }`.
- `RiskPills`: Renders computed risk flags plus preset business risks (zoning/pricing/permit/comp). Props: `{ flags }`.
- `StatsGrid`: Simple grid for KPI stats with optional loading state. Props: `{ stats, loading? }`.

## Pages (safe scope elements)
- `/`: Home lookup with normalized address feedback and live insight preview.
- `/properties`: Portfolio grid with filters placeholder (beds/baths/sqft/lot), stats, empty state guidance.
- `/admin`: Admin console with Jobber token status, ingestion controls, manual enrichment trigger; loading skeleton.
- `/admin/property-test`: Jobber request tester with loading skeleton.
- Loading skeletons for `/properties`, `/admin`, `/admin/property-test`, `/enrich`.

## Workflows
- **Lookup**: User enters address → `/api/property-insights` → enrichment/scoring → displayed in PropertyInsightCard.
- **Enrichment diagnostics**: `/api/enrich` returns property, sources, warnings, meta; manual trigger available in Admin.
- **Ingestion**: `/api/jobber/ingest` supports dry-run; properties view links to admin/test pages for empty states.

## Styling/State
- Components include skeletons/loading states; RiskPills includes preset pills even if flags empty.
- PropertyInsightCard compare variant hides gallery/map/timeline for side-by-side comparisons.
