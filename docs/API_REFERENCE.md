# API Reference (Scoped)

- `POST /api/enrich` — Body: `{ address: string }`. Runs enrichment with provider fallbacks. Response includes `data.property`, `sources`, and `errors` warnings (if any). Validates non-empty address.
- `POST /api/property-insights` — Body: `{ address: string, persist?: boolean, enrich?: boolean }`. Generates insights (enriched when enabled) and optionally persists if Supabase configured.
- `GET /api/properties` — Returns stored profiles and summary (mock if Supabase absent).
- `GET /api/properties/[id]` — Returns a single profile by id.
- `GET /api/jobber/authorize` — Redirects to Jobber OAuth (requires env vars).
- `GET /api/jobber/callback` — Handles OAuth callback, stores tokens in Supabase.
- `POST /api/jobber/refresh` — Refreshes Jobber token (Supabase required).
- `GET /api/jobber/requests` — Fetches recent requests, ingests when Supabase enabled; includes `tokenStatus` flag.
- `POST /api/jobber/ingest` — Forces ingestion of recent requests; returns ingest result and `tokenStatus`.
- `POST /api/jobber/client` — Fetches a Jobber client by id using stored token.
- `GET /api/status` — Health summary (Supabase/jobber/external providers config, token presence).
