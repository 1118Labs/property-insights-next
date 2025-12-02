# Supervisor Roadmap — Property Insights

Focus (safe scope): enrichment, scoring, Jobber integration, utils, API (enrich/jobber/properties), components (InsightCard/ScoreBadge/RiskPills/StatsGrid), supabase schema (additive), tests.

## Near-term (1–2 days)
- Add optional token auto-refresh path when Jobber tokens are stale (guarded by env, no OAuth changes).
- Persist enrichment provenance (sources/warnings) alongside stored properties/insights when Supabase is enabled.
- Expand Jobber ingestion tests with mocked edges (invalid/missing fields) and ensure logIngestionEvent is non-blocking.
- Add updated_at triggers in Supabase if desired (optional migrations, off by default).

## Mid-term (3–7 days)
- Integration tests for API routes using mocked Supabase client.
- Add background ingestion registry using cron stubs; enable manual “dry-run” mode for ingestion.
- Enhance scoring to incorporate geo/context inputs once available (lot zoning, climate risk).

## Cross-system notes
- Mirror retry/validation helpers and skeleton UI states in sister repo; see docs/CROSS_SYSTEM_NOTES.md.
