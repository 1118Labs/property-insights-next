# Getting Started (Property Insights)
1) Connect Jobber via `/api/jobber/authorize` (or admin UI). Verify token status in `/api/health`.
2) Ensure Supabase env vars are set (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`) and run migrations: `psql $SUPABASE_URL < supabase/schema.sql`.
3) Run a dry-run ingest: `POST /api/cron/run {"task":"jobber-ingest","dryRun":true}` (admin secret if configured).
4) Run a property lookup on the main dashboard; view details in `/properties` and `/properties/[id]`.
5) Check provider health and ingestion logs in the admin views; enable demo/safe mode if pausing writes.
