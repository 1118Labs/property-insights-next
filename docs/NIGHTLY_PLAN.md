# Nightly Plan (Property Insights)

Scope: enrichment, scoring, Jobber integration, utils, API endpoints (enrich/jobber/properties), components (InsightCard/ScoreBadge/RiskPills/StatsGrid), supabase schema (additive), related tests.

Priorities:
1) Enrichment resilience: stricter provider typing, validation helpers, improved fallback summaries; enrich API input validation; capture warnings in response.
2) Scoring rigor: additional risk flags for missing address/size, tuned weights and helper utilities; expand unit tests for valuations/rent and risk penalties.
3) Jobber robustness: edge validation, token staleness handling, ingestion logging and safer payload shaping; add smoke tests for mapping and ingestion errors.
4) Schema/infra: additive metadata (comments, updated_at) and cron/logging stubs; no key changes.
5) QA/docs: run lint/tests, log results in docs/NIGHTLY_QA.md and progress in docs/OVERNIGHT_PROGRESS_PI.md; summarize in MORNING_REPORT.md.
