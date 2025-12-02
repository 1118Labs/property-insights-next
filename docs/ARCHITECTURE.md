# Architecture Overview

- **Next.js App Router**: API routes for enrichment and Jobber integration live under `app/api/` (enrich, jobber/*, properties/*).
- **Domain layer**: `lib/` holds scoring (`lib/scoring.ts`), enrichment providers (`lib/enrichers/*`, `lib/enrichment/index.ts`), Jobber integration (`lib/jobber.ts`), Supabase clients (`lib/supabase/*`), and utilities (`lib/utils/*`).
- **Data model**: Types in `lib/types.ts`; Supabase schema in `supabase/schema.sql` (clients, properties, service_requests, property_insights, jobber_tokens, ingestion_events).
- **UI components (safe scope)**: Insight rendering lives in `components/PropertyInsightCard.tsx`, `ScoreBadge.tsx`, `RiskPills.tsx`, `StatsGrid.tsx` with skeleton/loading states.
- **Testing**: Vitest configured via `vitest.config.ts`; tests in `tests/` cover scoring, enrichment, and Jobber mapping.
