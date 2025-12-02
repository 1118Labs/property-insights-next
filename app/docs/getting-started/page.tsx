export default function GettingStartedPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-4 px-6 py-10 text-slate-800 dark:text-slate-100">
      <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Getting Started</h1>
      <ol className="list-decimal space-y-2 pl-5 text-sm">
        <li>Connect Jobber via the admin page or <code>/api/jobber/authorize</code> and confirm token status in <code>/api/health</code>.</li>
        <li>Ensure Supabase env vars are set and run migrations: <code>psql $SUPABASE_URL {"<"} supabase/schema.sql</code>.</li>
        <li>Run a dry-run ingest: <code>POST /api/cron/run {"{"}&quot;task&quot;:&quot;jobber-ingest&quot;,&quot;dryRun&quot;:true{"}"}</code> (admin secret if configured).</li>
        <li>Search a property on the main dashboard; view it in <code>/properties</code> and the detail page.</li>
        <li>Check provider health and ingestion logs in admin. Enable demo/safe mode if pausing writes.</li>
      </ol>
    </div>
  );
}
