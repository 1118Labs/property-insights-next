# Modules

- `lib/scoring.ts`: Heuristic scoring with weights, risk flags, valuations, and rent estimates.
- `lib/enrichment/index.ts`: Orchestrates provider fetches (Zillow/RentCast), merging, and returns warnings/sources.
- `lib/enrichers/*`: Provider-specific fetch/merge with retries and validation.
- `lib/jobber.ts`: OAuth token helpers, GraphQL fetches, edge validation, ingestion with logging, token staleness checks.
- `lib/utils/*`: Validation, retry, ingestion logging, cron registry.
- `app/api/enrich/route.ts`: Validates address input and runs enrichment pipeline.
- `app/api/jobber/*`: OAuth redirect, callback, requests, client fetch, refresh, and ingestion routes.
- `app/api/properties/*`: Lists property profiles and fetches detail.
- `components/*`: Insight display (card, score badge, risk pills, stats grid) with loading states.
- `supabase/schema.sql`: Core schema plus additive metadata fields.
