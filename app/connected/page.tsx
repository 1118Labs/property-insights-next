export default function ConnectedPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-white via-slate-50 to-slate-100 px-6 py-12 text-slate-900 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-white">
      <div className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <h1 className="text-2xl font-bold">Successfully connected Jobber → Property Insights</h1>
        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">You can now continue to your insights dashboard.</p>
        <a
          href="/property-insights"
          className="mt-6 inline-block rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
        >
          Go to Property Insights
        </a>
      </div>
    </div>
  );
}
