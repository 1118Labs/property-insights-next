"use client";

import { useQuery } from "@tanstack/react-query";
import { useState, useEffect, useMemo } from "react";

type JobberStatus = {
  connected: boolean;
  lastSync: string | null;
  lastError: string | null;
};

async function fetchJobberStatus(): Promise<JobberStatus> {
  const res = await fetch("/api/jobber/status");
  if (!res.ok) {
    throw new Error("Failed to fetch Jobber status");
  }
  return res.json();
}

export default function JobberStatusPage() {
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  // ❌ old (invalid)
  // useQuery({ queryKey, queryFn, onSuccess })

  // ✅ v5-compliant
  const query = useQuery({
    queryKey: ["jobber-status"],
    queryFn: fetchJobberStatus,
  });

  // v5 requires success side-effects inside useEffect
  useEffect(() => {
    if (query.isSuccess) {
      setLastChecked(Date.now());
    }
  }, [query.isSuccess]);

  const statusState = useMemo(() => {
    if (query.isLoading) return "loading";
    if (query.isError) return "error";
    if (!query.data?.connected) return "disconnected";
    return "connected";
  }, [query.data, query.isLoading, query.isError]);

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:shadow-md">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Integration</p>
            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Jobber Connection</h1>
            <p className="text-sm text-gray-600">Monitor connection health, status, and sync activity.</p>
          </div>
          <div className="text-xs text-gray-500">
            {lastChecked ? `Last checked: ${new Date(lastChecked).toLocaleTimeString()}` : ""}
          </div>
        </div>

        <div className="mt-4 space-y-3 text-sm text-gray-700">
          {statusState === "loading" && <p>Checking Jobber status…</p>}
          {statusState === "error" && (
            <p className="text-red-500">
              Failed to load Jobber status: {String(query.error)}
            </p>
          )}

          {statusState === "connected" && (
            <div className="space-y-1 rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-green-800">
              <p className="font-semibold">Connected</p>
              <p>
                Last synchronized:{" "}
                {query.data?.lastSync
                  ? new Date(query.data.lastSync).toLocaleString()
                  : "Never"}
              </p>
            </div>
          )}

          {statusState === "disconnected" && (
            <div className="space-y-1 rounded-lg border border-yellow-100 bg-yellow-50 px-4 py-3 text-yellow-800">
              <p className="font-semibold">Not connected</p>
              <p>Reconnect Jobber to resume syncing.</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            onClick={() => window.location.reload()}
            className="rounded-full border border-gray-300 bg-white px-4 py-2 text-sm font-semibold text-gray-800 shadow-sm transition hover:bg-gray-50"
          >
            Refresh Data
          </button>
          <button
            onClick={() => (window.location.href = "/jobber")}
            className="rounded-full bg-[#0A84FF] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#006BE6]"
          >
            Reconnect Jobber
          </button>
        </div>
      </section>
    </main>
  );
}
