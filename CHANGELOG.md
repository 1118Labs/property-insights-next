# Changelog

## v1.0.0
- Production readiness: health and provider diagnostics endpoints, correlation ids, standardized error responses, and in-memory rate limits for key APIs.
- Admin console refresh: navigation with theme toggle, global status banner, provider dashboard, ingestion logs, safe-mode banner, and manual ingest/rebuild modals.
- Property detail view with provenance, risk drilldown, history, map/photo placeholders, and export links; CSV exports exposed in UI.
- Safe mode flag to pause high-risk actions; optional admin shared secret guard for sensitive endpoints.
- Documentation added: release checklist, onboarding, ops runbook, and pipeline smoke checks.
- Experience polish: helper/tooltips, demo/analytics flags, feedback modal, session recap, clearer copy, and known limitations/getting-started docs. Empty states and confirmations hardened for final v1.

## Unreleased
- Added enrichment validation/retries and safer merges for provider data.
- Enhanced scoring weights, risk flags, valuations, and rent estimates; added unit tests.
- Hardened Jobber ingestion with edge validation, token staleness flagging, and ingestion logging helper.
- Introduced cron registry and ingestion logging utilities.
- Added loading states to insight components (ScoreBadge, StatsGrid, PropertyInsightCard).
- Added Vitest config and tests for scoring, enrichment, Jobber mapping.
- Added additive schema metadata (`updated_at`, `score_version`).
- Updated docs (architecture, modules, API reference, workflows, roadmap, QA notes, cross-system notes).
- Omega Build 4: multi-platform ingestion abstraction (Jobber/ServiceTitan/Housecall Pro), unified platform resolver, platform health endpoint, admin selector, ingestion event platform tagging, and platform-aware ingestion API.
- Omega Build 5: Quote & Job Estimation engine with pricing profiles, quote builder/store/versioning, quick estimate APIs, HTML export, admin quote generator, recommended upsells, and tests/docs (`docs/QUOTES.md`).
- Omega Build 6: AI scheduling + routing (job slots, routes, simulator, ICS export, scheduling config/metrics, UI scaffolds, tests).
- Omega Build 7: Client portal with passwordless tokens, invite/verify/approve APIs, portal pages for insights/quotes, simplified client components, activity tracking, middleware token handling, and docs (`docs/CLIENT_PORTAL.md`).
