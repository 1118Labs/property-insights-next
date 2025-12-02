"use client";

import { IngestionEventsList } from "@/components/IngestionEventsList";
import { ManualIngestModal } from "@/components/ManualIngestModal";
import { useState } from "react";

export default function IngestionLogPage() {
  const [open, setOpen] = useState(false);
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-emerald-700 dark:text-emerald-300">Admin</p>
          <h1 className="text-2xl font-semibold text-slate-900 dark:text-white">Ingestion & logs</h1>
          <p className="text-sm text-slate-600 dark:text-slate-300">Filter, search, and trigger manual runs.</p>
        </div>
        <button onClick={() => setOpen(true)} className="rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700">
          Run manual ingest
        </button>
      </div>
      <IngestionEventsList limit={25} />
      {open && <ManualIngestModal open={open} onClose={() => setOpen(false)} />}
    </div>
  );
}
