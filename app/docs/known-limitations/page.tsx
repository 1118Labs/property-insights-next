export default function KnownLimitationsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-10 text-slate-800 dark:text-slate-100">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Known Limitations & Data Caveats</h1>
      <ul className="list-disc space-y-2 pl-5 text-sm">
        <li>Demo mode uses mock providers; estimates may not match production data.</li>
        <li>Provider outages trigger circuit breakers and fallback heuristics; refresh once providers recover.</li>
        <li>Supabase must be configured for persistence; otherwise mock data is used and not saved.</li>
        <li>Jobber tokens can expire; health/status endpoints show stale tokens and must be refreshed.</li>
        <li>Pricing/rent heuristics are coarse; validate before quoting. Geo accuracy depends on provider coverage.</li>
        <li>Rate limits are in-memory only and reset on restart; add edge/network guards before broad rollout.</li>
      </ul>
    </div>
  );
}
