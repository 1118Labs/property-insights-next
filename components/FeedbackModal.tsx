"use client";

import { useState } from "react";

type Props = { open: boolean; onClose: () => void };

export function FeedbackModal({ open, onClose }: Props) {
  const [note, setNote] = useState("");
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl dark:border-slate-700 dark:bg-slate-800">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Feedback & Notes</h3>
          <button onClick={onClose} className="text-sm text-slate-600 hover:underline dark:text-slate-200">Close</button>
        </div>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
          Share quick feedback. This is a placeholder; please email support@property-insights.local or add notes below.
        </p>
        <textarea
          aria-label="Feedback notes"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          className="mt-3 h-28 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-sm text-slate-800 focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100"
          placeholder="Leave a note for the team…"
        />
        <div className="mt-3 flex justify-end gap-2 text-sm">
          <button onClick={onClose} className="rounded-lg border border-slate-200 bg-white px-3 py-2 font-semibold text-slate-700 shadow dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
