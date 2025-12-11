"use client";

import { Quote } from "@/lib/quotes/quote";
import { QuoteItemTable } from "@/components/QuoteItemTable";
import PIButton from "@/components/ui/PIButton";

export function ClientQuoteView({ quote, onApprove, onRequestChanges, loading }: { quote: Quote | null; onApprove?: () => void; onRequestChanges?: () => void; loading?: boolean }) {
  if (!quote) return <p className="text-sm text-slate-600 dark:text-slate-300">Quote not available.</p>;
  return (
    <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 ease-out hover:shadow-md">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-wide text-gray-500">Your Quote</p>
          <p className="text-xl font-semibold text-gray-900">{quote.serviceProfile}</p>
          <p className="text-sm text-gray-600">Clean, client-ready summary for easy approval.</p>
        </div>
        <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-right shadow-inner">
          <p className="text-xs text-gray-500">Total</p>
          <p className="text-2xl font-bold text-gray-900">${quote.total.toFixed(2)}</p>
        </div>
      </div>
      <div className="mt-2">
        <QuoteItemTable items={quote.items} />
      </div>
      {quote.recommendedItems?.length ? (
        <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50 p-3 text-xs text-emerald-800">
          <p className="font-semibold text-sm text-emerald-800">Recommended add-ons</p>
          <ul className="mt-1 list-disc pl-4 text-gray-700">
            {quote.recommendedItems.map((i) => (
              <li key={i.label}>{i.label} (${i.total.toFixed(2)})</li>
            ))}
          </ul>
        </div>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        <PIButton disabled={loading} onClick={onApprove} className="bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100">
          {loading ? "Submitting..." : "Approve quote"}
        </PIButton>
        <PIButton
          disabled={loading}
          onClick={onRequestChanges}
          variant="secondary"
          className="border-gray-300 bg-white text-gray-700"
        >
          Request changes
        </PIButton>
      </div>
    </div>
  );
}
