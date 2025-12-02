# Known Limitations & Data Caveats
- Demo mode uses mock providers; estimates may not match production data.
- Provider outages trigger circuit breakers and fallback heuristics; refresh once providers recover.
- Supabase must be configured for persistence; otherwise mock data is used and not saved.
- Jobber tokens can expire; health/status endpoints show stale tokens and must be refreshed.
- Pricing/rent heuristics are coarse; validate before quoting. Geo accuracy depends on provider coverage.
- Rate limits are in-memory only and reset on restart; add edge/network guards before broad rollout.
