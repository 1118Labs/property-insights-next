# QA Notes

- Unit coverage added for scoring (risk flags, valuations) and Jobber edge mapping; enrichment resilience tested without provider creds.
- Integration gaps: Jobber API routes with Supabase persistence and token refresh paths not covered in automated tests.
- No automatic `updated_at` triggers; consider adding DB triggers if consistency required.
- Pending: smoke tests for /api/enrich and /api/jobber/ingest with mocked fetch and Supabase admin client.
- Phase 7 QA added: mocked Supabase ingestion→insights integration, provenance persistence assertions, scoring drift regression guard, provider mock preset, ingestion event filter coverage, admin render without Supabase, snapshot tests, and load-test simulation stub for enrich burst.
