"use client";

import { useMemo } from "react";
import { Quote } from "@/lib/quotes/quote";
import { QuoteItemTable } from "@/components/QuoteItemTable";

export function QuotePreviewCard({ quote }: { quote: Quote | null }) {
  const summary = useMemo(() => {
    if (!quote) return null;
    return {
      totalItems: quote.items.length,
      recommended: quote.recommendedItems?.length || 0,
    };
  }, [quote]);

  if (!quote) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-4 text-sm text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        Generate a quote to preview pricing and line items.
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Quote preview</p>
          <p className="text-sm font-semibold text-slate-900 dark:text-white">{quote.serviceProfile}</p>
          <p className="text-[11px] text-slate-500 dark:text-slate-300">Version {quote.version}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-500 dark:text-slate-300">Total</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white">${quote.total.toFixed(2)}</p>
          <p className="text-xs text-slate-500 dark:text-slate-300">Subtotal ${quote.subtotal.toFixed(2)} · Tax ${quote.tax.toFixed(2)}</p>
        </div>
      </div>

      <QuoteItemTable items={quote.items} />

      {quote.recommendedItems?.length ? (
        <div className="rounded-lg bg-emerald-50 p-3 text-xs text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-100">
          <p className="font-semibold">Recommended add-ons</p>
          <ul className="mt-1 list-disc pl-4">
            {quote.recommendedItems.map((i) => (
              <li key={i.label}>{i.label} (${i.total.toFixed(2)})</li>
            ))}
          </ul>
        </div>
      ) : null}

      {quote.confidenceWarnings?.length ? (
        <div className="rounded-lg bg-amber-50 p-3 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-100">
          {quote.confidenceWarnings.map((w) => (
            <p key={w}>{w}</p>
          ))}
        </div>
      ) : null}

      {summary && (
        <p className="text-[11px] text-slate-500 dark:text-slate-300">
          Items: {summary.totalItems} · Recommended: {summary.recommended}
        </p>
      )}
    </div>
  );
}
