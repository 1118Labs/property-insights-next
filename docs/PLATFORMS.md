# Platforms: Jobber, ServiceTitan, Housecall Pro

This repo now supports a multi-platform ingestion abstraction for field service CRMs.

## Platform types
- `jobber` (default) — OAuth + GraphQL. Production-ready (existing flows).
- `servicetitan` — scaffolded adapter, mock data until API creds are configured.
- `housecall_pro` — scaffolded adapter, mock data until API creds are configured.

## Configuration
- Set `PLATFORM=jobber|servicetitan|housecall_pro` to select the active platform.
- Use `/api/platform-config` (admin) to update at runtime. When `ADMIN_SHARED_SECRET` is unset, the route is open; set the header `x-admin-secret` otherwise.
- Platform availability is surfaced at `/api/platform-health` and in the Admin “Service platform” selector.
- Safety guard: ServiceTitan / Housecall Pro throw structured errors when required env vars are missing.

## Adapters
- `lib/platforms/adapters/jobberClient.ts`: wraps existing Jobber auth + fetches. Uses `ensureJobberAccessToken` and `fetchRecentJobberRequests`.
- `lib/platforms/adapters/serviceTitanClient.ts`: mock interface; wire real endpoints via `SERVICETITAN_API_KEY`/`SERVICETITAN_BASE_URL`.
- `lib/platforms/adapters/housecallProClient.ts`: mock interface; wire real endpoints via `HCP_API_KEY`/`HCP_BASE_URL`.

## Normalization
- Normalizers convert platform data → `PropertyRecord`, `ClientRecord`, `ServiceRequestRecord`.
- Files: `lib/platforms/normalizers/*Normalizer.ts`.

## Ingestion
- Unified entry: `lib/ingestion/platformIngestion.ts` with `ingestFromPlatform({ platform, limit, dryRun })`.
- API: `/api/ingest` (generic) and `/api/jobber/ingest` (backward compatible).
- Ingestion events now record `platform` and can be filtered via `/api/ingestion-events?platform=...`.

## Webhooks
- Placeholders at `/api/webhooks/servicetitan` and `/api/webhooks/housecall-pro`; they log and record ingestion events only. Add signature verification + mapping when real payloads are available.

## Admin UI
- `PlatformSelector` component (Admin) to pick platform.
- Status page shows platform health + sanity snapshot (active platform, property counts).

## Future work
- Wire real ServiceTitan/HCP API clients (auth, pagination, webhooks).
- Persist normalized data for non-Jobber platforms into Supabase.
- Add per-workspace platform selection + storage instead of in-memory toggle.
- Add Job/WorkOrder ingestion flows and richer webhook parsing.
