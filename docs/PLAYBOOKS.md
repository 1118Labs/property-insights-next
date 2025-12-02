# Playbooks

## Jobber Ingestion (Dry Run vs Persist)
1. Call `POST /api/jobber/ingest` with optional `{ "dryRun": true }`.
2. The endpoint will auto-refresh tokens if possible and return `tokenStatus` (fresh/refreshed/stale-*).
3. Dry run returns ingest stats without DB writes; omit `dryRun` to persist when Supabase is enabled.

## Enrichment Handling
1. Call `POST /api/enrich` with `{ address }`; validates non-empty strings.
2. Providers are retried and validated; warnings are returned in response.
3. Enrichment logs sources/errors via ingestion events when Supabase is available.

## Token Health
- Use `/api/status` to see Jobber token presence and freshness flags; ingestion/requests endpoints also include `tokenStatus`.

## Testing/Lint
- `npm run lint`
- `npm run test` (Vitest suite for scoring, utils, Jobber, enrichment, properties APIs)
