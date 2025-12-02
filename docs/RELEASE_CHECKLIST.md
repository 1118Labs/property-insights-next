# Property Insights – Release Checklist

## Pre-flight
- Env vars set: `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JOBBER_AUTH_URL`, `JOBBER_CLIENT_ID`, `JOBBER_CLIENT_SECRET`, `JOBBER_REDIRECT_URI`, optional `ADMIN_SHARED_SECRET`, optional `SAFE_MODE`, optional provider keys (`ZILLOW_API_URL`, `ZILLOW_API_KEY`, `RENTCAST_API_KEY`).
- Run migrations: `psql $SUPABASE_URL < supabase/schema.sql` (additive, idempotent). See schema notes for indexes and rollback.
- Health checks: `curl -s https://<host>/api/health` (expect status `ok` or `degraded` with reasons). Verify `/api/provider-health`.
- Feature flags: ensure `SAFE_MODE` is `false` for production writes; set to `true` during maintenance.

## Test & build commands
- Unit/integration: `npm test` (Vitest) – expected all tests passing.
- Lint: `npm run lint` – expected clean.
- Build: `npm run build` – expected success.
- Smoke script (manual):  
  - `curl -s https://<host>/api/health`  
  - `curl -s -X POST https://<host>/api/property-insights -d '{"address":"123 Test"}' -H "Content-Type: application/json"`  
  - `curl -s -X POST https://<host>/api/cron/run -d '{"task":"jobber-ingest","dryRun":true}' -H "Content-Type: application/json"` (requires admin secret if configured; safe mode must be off).
- QA additions: snapshot tests, provider mock preset, ingestion-events filter coverage, mocked Supabase ingestion→insights integration, scoring drift guard, admin render without Supabase.

## Rollback
- If build fails: revert to previous deploy artefact/version in hosting platform.
- If migrations misbehave:  
  - Drop newly added columns only if safe to do so; otherwise hide feature flags.  
  - Restore DB snapshot if available.  
  - Switch `SAFE_MODE=true` to pause writes while investigating.
- If providers fail: rely on in-memory circuit breakers; set `SAFE_MODE=true` to block writes and ingestion.

## Operational notes
- Admin routes may require `x-admin-secret` when `ADMIN_SHARED_SECRET` is set; enforce at the edge if possible.
- Rate limits: in-memory guards on enrichment/property-insights/jobber ingest/cron to curb abuse.
- Logging/telemetry: correlation ids returned via `x-correlation-id` for tracing API errors.

## Latest pipeline (local)
- `npm test` → pass (40 tests)
- `npm run lint` → pass
- `npm run build` → pass
