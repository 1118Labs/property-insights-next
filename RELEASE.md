# Release Guide

## Pre-deploy
1) Run preflight/env check: `./scripts/preflight.sh`
2) Run full verification: `./scripts/build-verify.sh`
3) Ensure env flags set: `SAFE_MODE=false`, `NEXT_PUBLIC_DEMO_MODE=false`, analytics as desired.

## Deploy steps (Vercel/Node)
- Set env vars in hosting platform (Supabase keys, Jobber keys, optional ADMIN_SHARED_SECRET).
- Optional multi-platform ingest: set `PLATFORM=jobber|servicetitan|housecall_pro` and corresponding API keys before deploy; verify `/api/platform-health`.
- Quote engine: optional `AUTO_GENERATE_QUOTES=true` for auto-quote on enrichment; pricing overrides via `PRICING_OVERRIDES_JSON`, `PRICING_TAX_RATE`.
- Deploy build artifact (Next.js 16). Verify health: `curl /api/health`.
- Verify provider-health: `curl /api/system-health`.
- Run smoke: `curl -X POST /api/property-insights -d '{"address":"123 Test"}'`.

## Post-deploy
- Check admin status page (`/admin/status`) and provider dashboard.
- Run nightly script (optional): `./scripts/nightly-run.sh`.
- Monitor logs for structured entries (health_check, enrich_request, property_insight).

## Rollback
- Use platform rollback to previous release.
- Toggle `SAFE_MODE=true` if needing to pause writes during investigation.
