"use client";

import { QuoteItem } from "@/lib/quotes/quote";

export function QuoteItemTable({ items }: { items: QuoteItem[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-slate-200 dark:border-slate-700">
          <th className="py-2 text-left font-semibold text-slate-700 dark:text-slate-100">Item</th>
          <th className="py-2 text-left font-semibold text-slate-700 dark:text-slate-100">Qty</th>
          <th className="py-2 text-left font-semibold text-slate-700 dark:text-slate-100">Rate</th>
          <th className="py-2 text-right font-semibold text-slate-700 dark:text-slate-100">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.label} className="border-b border-slate-100 dark:border-slate-800">
            <td className="py-2 text-slate-800 dark:text-slate-100">{item.label}</td>
            <td className="py-2 text-slate-600 dark:text-slate-300">{item.quantity} {item.unit}</td>
            <td className="py-2 text-slate-600 dark:text-slate-300">${item.unitPrice.toFixed(2)}</td>
            <td className="py-2 text-right text-slate-800 dark:text-slate-100">${item.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
