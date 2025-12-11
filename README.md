# Property Insights MVP

End-to-end MVP for Property Insights: ingest Jobber requests, persist them in Supabase, auto-generate property insights, and surface dashboards for operations.

## Stack
- Next.js App Router + TypeScript + Tailwind
- Supabase (clients, properties, service_requests, jobber_tokens, property_insights)
- Jobber OAuth + GraphQL

## Run locally
1) Install deps: `npm install`
2) Configure env (create `.env.local`):
```
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
JOBBER_AUTH_URL=https://api.getjobber.com/api/oauth/authorize
JOBBER_CLIENT_ID=...
JOBBER_CLIENT_SECRET=...
JOBBER_REDIRECT_URI=http://localhost:3000/api/jobber/callback
```
3) Apply schema to Supabase: `psql $SUPABASE_URL < supabase/schema.sql` (ensure `pgcrypto` enabled)
4) Dev server: `npm run dev`

## Key flows
- **Jobber OAuth**: `/api/jobber/authorize` → `/api/jobber/callback` stores tokens in `jobber_tokens`.
- **Token refresh**: POST `/api/jobber/refresh`.
- **Ingestion**: POST `/api/jobber/ingest` fetches latest requests via GraphQL and upserts clients, properties, and service_requests.
- **Insights**: POST `/api/property-insights` runs heuristic scoring and optionally persists the property.
- **Portfolio**: GET `/api/properties` lists stored properties + summary, GET `/api/properties/[id]` fetches one.
- **Status**: GET `/api/status` shows env/token readiness.
- **Health + diagnostics**: GET `/api/health` (supabase/jobber/providers), GET `/api/provider-health` for in-memory metrics.
- **Platforms**: `/api/platform-config` to view/set active platform (Jobber/ServiceTitan/Housecall Pro), `/api/platform-health` for per-platform status, `/api/ingest` for platform-agnostic ingest. Default remains Jobber.
- **Exports**: GET `/api/export/properties.csv`, GET `/api/export/insights.csv` (mocked when Supabase disabled).
- **Admin downloads**: CSV exports surfaced in Admin dashboard; insight export includes provenance/meta for diagnostics.
- **Ingestion events**: GET `/api/ingestion-events?source=&status=&q=&limit=&offset=` supports filtering + pagination for the admin log viewer.
- **Safety**: Optional `ADMIN_SHARED_SECRET` header guard on admin APIs; `SAFE_MODE=true` disables ingestion/rebuild actions and surfaces UI banner.
- **Modes**: `NEXT_PUBLIC_DEMO_MODE=true` labels demo/sample data and disables risky actions; `ANALYTICS_ENABLED=true` enables in-app, in-memory event logging only.
- **Exports**: Insights provenance CSV at `/api/export/insights-provenance.csv`.
- **Health/system**: `/api/system-health` for provider metrics; admin status page for uptime/failures (placeholder).
- **Ask Insight**: `/api/ask-insight?q=` synthesizes narratives/trends; enriched profiles include confidence, quality index, taxonomy, trends.
- **Aerial intelligence (beta)**: `/api/analyze-aerial` performs geocode → tile fetch → segmentation; enrichment attaches `aerialInsights` (provider, yard/roof/driveway sqft, pool detection) and feeds service-specific modules.
- **Exports**: ingestion events CSV and insights provenance CSV; batch dry-run available via `/api/cron/run` with `task: "property-insights-batch"`.

## UI map
- `/` — Marketing + quick address lookup, live insight preview
- `/properties` — Portfolio dashboard with scores and risk flags
- `/properties/[id]` — Detail view with provenance, risk drilldown, history, map/photo placeholders
- `/admin` — Integration health + ingestion controls
- `/admin/property-test` — Raw Jobber request tester
- `/admin/ingestion-log` — Ingestion event filters + manual ingest modal
- `/admin/providers` — Provider diagnostics & circuit indicators
- `/admin/health` — Health banner, webhook simulator, address normalization helper
- `/docs/GETTING_STARTED.md` — Quick start for connecting, checking health, and running first ingest
- `/docs/KNOWN_LIMITATIONS.md` — Provider caveats and data notes

## Admin + diagnostics components (opt-in)
- `HealthStatusBanner` — summarize API health (supabase/jobber/provider counts).
- `JobberConnectionMonitor` — token expiry countdown + failure counter.
- `ProviderDiagnosticsDashboard` — in-memory provider uptime/error/latency (pulls `/api/health`).
- `IngestionEventsList` — filterable/paginated ingestion events.
- `ManualIngestModal` / `RebuildInsightsModal` — safe, manual triggers for ingestion/rebuild (no scheduling).
- `PropertyProvenancePanel` / `PropertyHistoryPanel` / `RiskFactorBreakdown` — provenance + scoring details.
- `CircuitBreakerIndicator`, `WebhookSimulator`, `AddressNormalizePreview`, `StaticMapPreview`, `PhotoPlaceholder` — lightweight utility widgets for admin/debug surfaces.
- `FeedbackModal`, session recap, helper/tooltips, and “What am I looking at?” explainer to make demos clear and trustworthy.

## Notes
- When Supabase env vars are missing, the app falls back to mock data for insights but Jobber flows require Supabase for token storage.
- Scoring uses heuristic breakdown (livability, efficiency, market strength, risk) and generates valuations/rent estimates.

## Quick Start for Non-Developers
1) Install dependencies: `npm install`
2) Create `.env.local` using the keys listed above (ask the team for values).
3) Run the app: `npm run dev` and open `http://localhost:3000`.
4) Smoke test the Jobber → Portal flow:
   - Visit `/dashboard/jobber` and click **Connect Jobber** (North Fork Maids dev account).
   - Trigger a sync if available.
   - Open `/dashboard/requests` to see synced requests.
   - Click a request to view the property detail.
   - Generate a portal invite and open the portal URL in an incognito window to view the client experience.
