# Nightly Summary

- Enrichment: Added retries/validation, logging warnings via ingestion events, and tests for /api/enrich.
- Scoring: Strengthened weights/risk flags; tests compare modern vs dated properties.
- Jobber: Added token auto-refresh helper, stale detection fix, dry-run ingest support, client route validation, and expanded tests (helper, ingest API, mapping).
- Utils: Added validation/retry/ingestion helpers and cron registry; tests cover validation and retry.
- Components: ScoreBadge/StatsGrid/PropertyInsightCard have loading states.
- Schema: Additive metadata (`updated_at`, `score_version`) with notes.
- Docs: Supervisor roadmap, QA notes, architecture/module/API/workflow docs, changelog, release guide, cross-system notes, nightly progress entries.
- Quality: Lint clean; tests 18/18 passing.
