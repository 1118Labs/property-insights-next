"use client";

import Link from "next/link";

export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-white via-slate-50 to-slate-100 px-4 text-center text-slate-800 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900 dark:text-slate-100">
      <div className="space-y-3 rounded-2xl border border-amber-200 bg-white p-8 shadow-sm dark:border-amber-800 dark:bg-slate-900">
        <p className="text-xs uppercase tracking-wide text-amber-700 dark:text-amber-300">Something went wrong</p>
        <h1 className="text-2xl font-semibold">We hit a snag</h1>
        <p className="text-sm text-slate-600 dark:text-slate-300">Please try again or contact support if this persists.</p>
        <p className="text-xs text-slate-500 dark:text-slate-400">{error?.message}</p>
        <div className="flex flex-wrap items-center justify-center gap-2 text-sm">
          <button onClick={reset} className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white shadow hover:bg-emerald-700">
            Try again
          </button>
          <Link href="/" className="rounded-lg border border-slate-200 bg-white px-4 py-2 font-semibold text-slate-700 shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
