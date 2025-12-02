# Release Guide

1. Ensure environment variables are set for Supabase and Jobber (see README): `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `JOBBER_*`, optional `ZILLOW_*`, `RENTCAST_API_KEY`.
2. Run quality gates:
   - `npm run lint`
   - `npm run test`
   - `npm run build`
3. Apply Supabase schema (safe additive): `psql $SUPABASE_URL < supabase/schema.sql`.
4. Verify Jobber OAuth callback URL matches `JOBBER_REDIRECT_URI` and app URL.
5. Deploy (e.g., Vercel/Netlify) with env vars set. Confirm `/api/status` returns configured=true for required services.
6. Monitor logs for ingestion events; token staleness returned in Jobber endpoints.
