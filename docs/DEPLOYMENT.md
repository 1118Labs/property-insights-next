# Deployment Checklist (Omega Build 9)

- Env validation: ensure required keys set (Supabase, Jobber, ADMIN_SHARED_SECRET, platform keys). `NOTIFICATIONS_DISABLED=true` to disable mail/SMS in prod if needed.
- Cache TTLs configurable via `CACHE_TTL_*` env (insights, quotes, aerial, schedule, portal).
- Rate limits: notifications `NOTIFY_RATE_LIMIT`, provider guards baked into enrichment.
- Security headers via middleware (CSP, X-Frame-Options, X-Content-Type-Options).
- Build verification: `./scripts/build-prod-verify.sh`.
- Migration verification: confirm `supabase/schema.sql` applied; indexes present.
- Health endpoints: `/api/health`, `/api/provider-health`, `/api/platform-health` (includes notification status), `/api/system-health`.
- Smoke tests: `/api/property-insights`, `/api/quote/build`, `/api/schedule/simulate`.
- Safe modes: `SAFE_MODE`, `PORTAL_DISABLED`, `NOTIFICATIONS_DISABLED`, `AUTO_GENERATE_QUOTES`.
