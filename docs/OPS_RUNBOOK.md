# Ops Runbook – Property Insights

## When /api/health is failing
- Check response for subsystem status codes. If Supabase errors: verify env keys and DB availability. If Jobber stale: refresh token via `/api/jobber/refresh` (requires admin secret if configured). If providers degraded: circuits may be open; retry after cooldown.
- Enable `SAFE_MODE=true` to pause ingestion/rebuild while investigating.

## Token refresh issues
- Health/status endpoints show `tokenStatus` and `daysRemaining`.
- If refresh fails: re-run `/api/jobber/authorize` to reconnect; ensure Supabase is reachable for token storage.
- Avoid logging tokens; only store encrypted in Supabase.

## Provider outages and circuits
- `/api/provider-health` shows error rates/latency; provider dashboard in admin shows circuit indicators.
- Circuits auto-open after repeated failures and cool off for 5 minutes. No manual toggle exposed.
- If providers down, enrichment falls back to mock/heuristic data and logs warnings.

## Ingestion failures
- Check `/api/ingestion-events` for recent errors.
- Trigger dry-run via `/api/cron/run` with `{"task":"jobber-ingest","dryRun":true}` (requires admin secret, safe mode off).
- Review Jobber GraphQL reachability and credentials.

## Logs & telemetry
- Telemetry stored in-memory (counters, provider health); persistent logs go to hosting platform logs.
- All error responses return `correlationId` header for cross-referencing logs.

## Maintenance / Safe Mode
- Set `SAFE_MODE=true` to disable ingestion/rebuild actions. Admin UI shows a banner and disables buttons.
- Revert to `SAFE_MODE=false` when ready to resume writes.

## Rollback guidance
- Use platform deploy rollback; re-run migrations only if forward-only; otherwise restore from DB snapshot.
- If schema change caused issues, set safe mode and disable new features until fixed.
