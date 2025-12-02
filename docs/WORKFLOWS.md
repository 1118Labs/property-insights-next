# Workflows

## Enrichment
1. Call `POST /api/enrich` with an address.
2. Providers (Zillow/RentCast) are attempted with retries; missing envs fallback to heuristics.
3. Response includes property, sources used, and any warning strings.

## Jobber connect and ingest
1. Hit `GET /api/jobber/authorize` to start OAuth.
2. After callback, tokens stored in `jobber_tokens` (Supabase required).
3. Trigger ingestion via `POST /api/jobber/ingest` (or `GET /api/jobber/requests` which also ingests) — returns ingest stats and tokenStatus (fresh/stale).

## Scoring
- `lib/scoring.scoreProperty` calculates insight score and risk flags using heuristic weights; used by enrichment and properties API.

## Testing
- Run `npm run lint` for linting; `npm run test` for Vitest suite (unit coverage on scoring, enrichment, Jobber mapping).
