# Engineer Onboarding – Property Insights

## Local setup
1) Install Node 20+: `npm install`.
2) Copy `.env.local.example` (or set vars) with Supabase + Jobber keys (see README).
3) Apply schema to a local/staging Supabase: `psql $SUPABASE_URL < supabase/schema.sql`.
4) Run dev: `npm run dev` (App Router).
5) Run tests: `npm test`; lint: `npm run lint`; build: `npm run build`.

## Connecting to staging
- Set `NEXT_PUBLIC_APP_URL` to staging host.
- Configure Supabase keys for staging project.
- Obtain Jobber OAuth creds for staging and set `JOBBER_*` vars.
- Optional: set `ADMIN_SHARED_SECRET` and use `x-admin-secret` headers for admin APIs.

## Debugging tips
- Health: `GET /api/health` and `/api/provider-health` for provider circuits/uptime.
- Enrichment: `POST /api/enrich` with mock providers (use `MOCK_ZILLOW=true`, `MOCK_RENTCAST=true`).
- Ingestion: `POST /api/cron/run` with `{"task":"jobber-ingest","dryRun":true}` (requires admin secret if configured).
- Safe mode: set `SAFE_MODE=true` to block ingestion/rebuild actions during incidents.
- Correlation IDs: error responses include `correlationId` and `x-correlation-id` header for tracing logs.
