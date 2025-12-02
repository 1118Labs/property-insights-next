"use client";
import { useEffect, useMemo, useState } from "react";

type Event = { id: string; source: string; status: string; platform?: string | null; detail?: Record<string, unknown>; created_at?: string };

export function IngestionEventsList({ limit = 20 }: { limit?: number }) {
  const [events, setEvents] = useState<Event[]>([]);
  const [q, setQ] = useState("");
  const [source, setSource] = useState("");
  const [status, setStatus] = useState("");
  const [platform, setPlatform] = useState("");
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    params.set("limit", String(limit));
    params.set("offset", String(offset));
    if (q) params.set("q", q);
    if (source) params.set("source", source);
    if (status) params.set("status", status);
    if (platform) params.set("platform", platform);
    const res = await fetch(`/api/ingestion-events?${params.toString()}`);
    const body = await res.json();
    if (res.ok) {
      setEvents(body.data || []);
      setTotal(body.count || 0);
    }
    setLoading(false);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offset]);

  const grouped = useMemo(() => {
    return events.reduce((acc, evt) => {
      const key = evt.created_at ? new Date(evt.created_at).toDateString() : "Unknown";
      acc[key] = acc[key] || [];
      acc[key].push(evt);
      return acc;
    }, {} as Record<string, Event[]>);
  }, [events]);

  const pages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.floor(offset / limit) + 1;

  return (
    <div className="space-y-2">
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search detail" className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <input value={source} onChange={(e) => setSource(e.target.value)} placeholder="Source" className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <input value={status} onChange={(e) => setStatus(e.target.value)} placeholder="Status" className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <input value={platform} onChange={(e) => setPlatform(e.target.value)} placeholder="Platform" className="rounded-lg border border-slate-200 px-2 py-1 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100" />
        <div className="flex items-center justify-end gap-2">
          <button onClick={() => { setOffset(0); load(); }} className="rounded-lg bg-slate-900 px-2 py-1 text-xs font-semibold text-white dark:bg-slate-100 dark:text-slate-900">Filter</button>
          <span className="text-right text-[11px] text-slate-500 dark:text-slate-300">{loading ? "Loading…" : `${total} events`}</span>
        </div>
      </div>

      <div className="space-y-3">
        {Object.entries(grouped).map(([day, items]) => (
          <div key={day} className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-300">{day}</p>
            {items.map((evt) => (
              <div key={evt.id} className="rounded-lg border border-slate-200 bg-white p-3 text-xs shadow-sm dark:border-slate-700 dark:bg-slate-800">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900 dark:text-white">{evt.source}</span>
                  <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold uppercase text-slate-700 dark:bg-slate-900 dark:text-slate-200">{evt.status}</span>
                </div>
                <div className="text-slate-600 dark:text-slate-300 flex items-center justify-between">
                  <span>{evt.created_at ? new Date(evt.created_at).toLocaleTimeString() : ""}</span>
                  {evt.platform && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold uppercase text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-200">{evt.platform}</span>}
                </div>
                <pre className="mt-1 max-h-32 overflow-auto rounded bg-slate-50 p-2 text-[10px] text-slate-700 dark:bg-slate-900 dark:text-slate-100">{JSON.stringify(evt.detail || {}, null, 2)}</pre>
              </div>
            ))}
          </div>
        ))}
        {events.length === 0 && !loading && <p className="text-xs text-slate-500 dark:text-slate-300">No events.</p>}
      </div>
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <button onClick={() => setOffset((o) => Math.max(0, o - limit))} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">Prev</button>
        <span>Page {currentPage} / {pages}</span>
        <button onClick={() => setOffset((o) => (o + limit < total ? o + limit : o))} className="rounded bg-slate-100 px-2 py-1 dark:bg-slate-800">Next</button>
      </div>
    </div>
  );
}
