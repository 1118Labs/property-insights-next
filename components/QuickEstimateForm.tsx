"use client";

import { useState } from "react";
import { Quote } from "@/lib/quotes/quote";
import { QuotePreviewCard } from "@/components/QuotePreviewCard";

export function QuickEstimateForm() {
  const [address, setAddress] = useState("");
  const [serviceProfile, setServiceProfile] = useState("cleaning");
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/estimate-quick?address=${encodeURIComponent(address)}&serviceProfile=${serviceProfile}`);
      const body = await res.json();
      if (!res.ok) throw new Error(body.message || "Failed to estimate");
      setQuote(body.data);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center gap-2">
        <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Address" className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <select value={serviceProfile} onChange={(e) => setServiceProfile(e.target.value)} className="rounded-lg border border-slate-200 px-2 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
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
        <button onClick={submit} disabled={loading || !address} className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-semibold text-white shadow disabled:opacity-60 dark:bg-slate-100 dark:text-slate-900">
          {loading ? "Estimating…" : "Quick estimate"}
        </button>
      </div>
      {error && <p className="text-xs text-rose-600 dark:text-rose-300">{error}</p>}
      <QuotePreviewCard quote={quote} />
    </div>
  );
}
