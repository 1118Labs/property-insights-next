# UI Flows, Props, States, Debugging

## Flows
- Home lookup → `/api/property-insights` → enrichment/scoring → renders PropertyInsightCard preview.
- Enrichment only → `/api/enrich` returns property, sources, warnings, meta; manual trigger in Admin.
- Properties dashboard → `/api/properties` data → grid of PropertyInsightCard (with compare variant support).
- Admin → Jobber token status, ingestion triggers, manual enrichment, keyboard shortcuts (Cmd/Ctrl+R refresh token, Cmd/Ctrl+I ingest).
- Ingestion logs → `/admin/ingestion-log` consumes `/api/ingestion-events` with filters.

## Components / Props
- PropertyInsightCard `{ profile, loading?, variant?: "default" | "compare" }`; includes gallery (lightbox), map stub, timeline placeholder, provenance, normalized details.
- PropertyHealthWidget `{ profile }` quick metrics.
- ScoreBadge `{ score, label?, isLoading? }` with quality tiers.
- RiskPills `{ flags }` plus preset risks.
- StatsGrid `{ stats, loading? }` with skeletons.
- Banners: WarningBanner/SuccessBanner `{ message, children? }`.

## States
- Loading: skeletons in score badge, stats grid, gallery/map/timeline, loading.tsx pages for admin/properties/enrich/property-test.
- Errors: provenance and risk pills surface warnings; ingestion log viewer shows JSON details.
- Token: status banner in home/admin (fresh/stale/missing).

## Debugging patterns
- Use `/api/status` and `/api/provider-health` to inspect integration readiness and provider metrics.
- Check `/api/ingestion-events` for ingestion history; view `/admin/ingestion-log` UI.
- Enable mocks: `MOCK_ZILLOW=true`, `MOCK_RENTCAST=true` to bypass providers in tests.
- Telemetry: in-memory counters/events via `lib/utils/telemetry` (not persisted).
- Retry/circuit: `withRetry` uses exponential backoff and circuit breaker; provider calls log metrics.
