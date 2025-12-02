# Property Logic Pipeline

1) **Input validation**
   - API inputs validated via Zod (`lib/utils/validationSchema.ts`) for addresses/persist/enrich flags.
   - Enrichment uses adapter discovery and only merges when providers return valid data.

2) **Enrichment (lib/enrichment/index.ts)**
   - Adapters (`lib/enrichment/adapters.ts`) for Zillow/RentCast (env-gated).
   - Provider fetch → merge with existing property fields (prefers existing data).
   - Errors normalized per provider; cached responses (TTL) for repeated addresses.
   - Optional geocode stub for future lat/long enrichment.
   - Logs ingestion events (Supabase) when sources or errors exist.
   - Telemetry counters increment on runs/errors.

3) **Scoring (lib/scoring.ts)**
   - Heuristic weights with scoreVersion, risk flags (small footprint, minimal sqft, small lot, older/unknown age, missing geo).
   - Breakdown includes livability, efficiency, marketStrength, lotAppeal, ageFactor, equityDelta, risk.
   - Valuation/rent heuristics and recommendations produced alongside score.

4) **Jobber ingestion (lib/jobber.ts, lib/utils/background.ts)**
   - Token auto-refresh helper (`ensureJobberAccessToken`) with stale detection and status reporting.
   - Jobber GraphQL requests validated via schema (`lib/jobber/validation.ts`), mapped into local records, ingested to Supabase.
   - Dry-run ingestion supported in API and background task.
   - Telemetry counters for ingestion attempts/errors; ingestion_events logging.

5) **Persistence & schema**
   - Supabase schema (`supabase/schema.sql`) covers clients, properties, service_requests, property_insights, jobber_tokens, ingestion_events; additive `updated_at`, `score_version` fields.

6) **APIs**
   - `/api/enrich`: returns normalized data { property, sources, warnings, meta }.
   - `/api/property-insights`: generates insights (enrich or heuristic) with validation.
   - `/api/properties`: wraps items+summary under data; detail under `/api/properties/[id]`.
   - Jobber routes: authorize, callback, refresh, requests, ingest (dry-run), client.

7) **UI components (safe scope)**
   - Insight card, score badge, stats grid, risk pills with loading states for previews.

8) **Testing**
   - Vitest suite exercises scoring, utils, jobber helpers/APIs, enrichment, properties APIs, chain smoke.

9) **Telemetry & caching**
   - In-memory cache for enrichment (TTL); telemetry counters in-memory for runs/errors; cron/background stub for ingestion.
