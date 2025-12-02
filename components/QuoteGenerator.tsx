"use client";

import { useState } from "react";
import { Quote } from "@/lib/quotes/quote";
import { QuotePreviewCard } from "@/components/QuotePreviewCard";

export function QuoteGenerator({ propertyId, defaultProfile = "cleaning" }: { propertyId: string; defaultProfile?: string }) {
  const [serviceProfile, setServiceProfile] = useState(defaultProfile);
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generate = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/quote/build", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ propertyId, serviceProfile }),
      });
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to build quote");
      setQuote(body.data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-300">Generate Quote</p>
          <p className="text-sm text-slate-600 dark:text-slate-300">Build a quote from the latest insights.</p>
        </div>
        <div className="flex gap-2">
          <select value={serviceProfile} onChange={(e) => setServiceProfile(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-1 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            <option value="cleaning">Cleaning</option>
            <option value="lawncare">Lawncare</option>
            <option value="roofing">Roofing</option>
            <option value="painting">Painting</option>
            <option value="window_washing">Window washing</option>
            <option value="pressure_washing">Pressure washing</option>
            <option value="gutter_cleaning">Gutter cleaning</option>
            <option value="snow_removal">Snow removal</option>
            <option value="pool_service">Pool service</option>
          </select>
          <button onClick={generate} disabled={loading} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow disabled:opacity-60">
            {loading ? "Building…" : "Generate"}
          </button>
        </div>
      </div>
      {error && <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>}
      <QuotePreviewCard quote={quote} />
    </div>
  );
}
