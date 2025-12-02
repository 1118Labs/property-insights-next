"use client";

import { Quote } from "@/lib/quotes/quote";
import { QuoteItemTable } from "@/components/QuoteItemTable";

export function ClientQuoteView({ quote, onApprove, onRequestChanges, loading }: { quote: Quote | null; onApprove?: () => void; onRequestChanges?: () => void; loading?: boolean }) {
  if (!quote) return <p className="text-sm text-slate-600 dark:text-slate-300">Quote not available.</p>;
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Your quote</p>
          <p className="text-lg font-semibold text-slate-900 dark:text-white">{quote.serviceProfile}</p>
        </div>
        <div className="text-right text-sm text-slate-700 dark:text-slate-200">
          <p className="text-xs text-slate-500 dark:text-slate-300">Total</p>
          <p className="text-xl font-bold text-slate-900 dark:text-white">${quote.total.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-3">
        <QuoteItemTable items={quote.items} />
      </div>
      {quote.recommendedItems?.length ? (
        <div className="mt-3 rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
          <p className="font-semibold">Recommended add-ons</p>
          <ul className="mt-1 list-disc pl-4">
            {quote.recommendedItems.map((i) => (
              <li key={i.label}>{i.label} (${i.total.toFixed(2)})</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-3 flex flex-wrap gap-2">
        <button disabled={loading} onClick={onApprove} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow disabled:opacity-60">
          {loading ? "Submitting..." : "Approve quote"}
        </button>
        <button disabled={loading} onClick={onRequestChanges} className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
          Request changes
        </button>
      </div>
    </div>
  );
}
