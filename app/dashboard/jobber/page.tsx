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
    <div className="p-6 text-white">
      <h1 className="text-3xl font-bold mb-4">Jobber Connection</h1>

      {statusState === "loading" && <p>Checking Jobber status…</p>}
      {statusState === "error" && (
        <p className="text-red-400">
          Failed to load Jobber status: {String(query.error)}
        </p>
      )}

      {statusState === "connected" && (
        <div className="space-y-2">
          <p className="text-green-400">Connected</p>
          <p>
            Last synchronized:{" "}
            {query.data?.lastSync
              ? new Date(query.data.lastSync).toLocaleString()
              : "Never"}
          </p>
        </div>
      )}

      {statusState === "disconnected" && (
        <p className="text-yellow-400">
          Not connected to Jobber — go to Settings.
        </p>
      )}

      {lastChecked && (
        <p className="text-xs text-white/50 mt-4">
          Last checked: {new Date(lastChecked).toLocaleTimeString()}
        </p>
      )}
    </div>
  );
}
