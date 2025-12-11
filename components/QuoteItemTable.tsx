"use client";

import { QuoteItem } from "@/lib/quotes/quote";

export function QuoteItemTable({ items }: { items: QuoteItem[] }) {
  return (
    <table className="w-full text-sm">
      <thead>
        <tr className="border-b border-gray-200 bg-gray-50">
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Item</th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Qty</th>
          <th className="px-3 py-2 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">Rate</th>
          <th className="px-3 py-2 text-right text-xs font-semibold uppercase tracking-wide text-gray-500">Total</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.label} className="border-b border-gray-100 hover:bg-gray-50 transition">
            <td className="px-3 py-2 text-sm text-gray-800">{item.label}</td>
            <td className="px-3 py-2 text-sm text-gray-700">
              {item.quantity} {item.unit}
            </td>
            <td className="px-3 py-2 text-sm text-gray-700">${item.unitPrice.toFixed(2)}</td>
            <td className="px-3 py-2 text-right text-sm text-gray-900">${item.total.toFixed(2)}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
