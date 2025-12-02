import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 text-center text-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="space-y-3 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Not found</p>
        <h1 className="text-3xl font-semibold">We couldn’t find that page</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">The property or admin view you’re looking for may have moved or doesn’t exist.</p>
        <Link href="/" className="inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
          Go home
        </Link>
      </div>
    </div>
  );
}
