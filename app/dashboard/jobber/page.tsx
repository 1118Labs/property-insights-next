"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import Hint from "@/components/onboarding/Hint";
import { isDemoModeEnabled, isOnboardingHintsEnabled } from "@/lib/featureFlags";
import Image from "next/image";
import PIButton from "@/components/ui/PIButton";
import PICard from "@/components/ui/PICard";
import StatusPill from "@/components/ui/StatusPill";

type JobberStatus = {
  connected: boolean;
  jobber_account_id?: string;
  error?: string;
};

async function fetchJobberStatus(): Promise<JobberStatus> {
  const res = await fetch("/api/jobber/status", { cache: "no-store" });
  return (await res.json()) as JobberStatus;
}

export default function JobberConnectPage() {
  const hintsEnabled = isOnboardingHintsEnabled();
  const demoMode = isDemoModeEnabled();
  const [lastChecked, setLastChecked] = useState<number | null>(null);

  const { data, isLoading, isError, refetch, isFetching } = useQuery<JobberStatus>({
    queryKey: ["jobber-status"],
    queryFn: fetchJobberStatus,
    onSuccess: () => setLastChecked(Date.now()),
  });

  const statusState = useMemo(() => {
    if (isLoading) return "loading";
    if (data?.connected) return "connected";
    return "disconnected";
  }, [data?.connected, isLoading]);

  const accountLabel = data?.jobber_account_id
    ? `${data.jobber_account_id.slice(0, 6)}…`
    : null;

  const connect = () => {
    window.location.href = "/api/jobber/authorize";
  };

  return (
    <div className="relative min-h-screen bg-white text-slate-900">
      <div className="relative flex">
        <Sidebar />
        <main className="flex-1">
          <TopBar
            title="Jobber Integration"
            userName="Ops Team"
            lastSync={
              isFetching
                ? "Refreshing Jobber status…"
                : lastChecked
                ? `Last checked ${new Date(lastChecked).toLocaleTimeString()}`
                : "Last sync just now"
            }
            showJobberStatus
            subtitle="Connect Jobber once and keep requests flowing into Property Insights."
          />
          <div className="mx-auto max-w-3xl space-y-6 px-6 py-10">
            <Image
              src="/brand/pi-logo.png"
              alt="Property Insights Logo"
              width={42}
              height={42}
              className="h-8 w-auto opacity-90"
            />

            {hintsEnabled && demoMode && (
              <Hint
                title="Demo mode active"
                body="You are in demo mode. Connect Jobber in a live environment to sync real data."
              />
            )}

            <div className="space-y-2">
              <h1 className="text-2xl font-semibold text-slate-900">Jobber Integration</h1>
              <p className="text-sm text-slate-600 max-w-md">
                Connect once and keep requests flowing into Property Insights with automatic enrichment.
              </p>
            </div>

            <PICard className="space-y-4">
              <div className="flex items-center justify-between">
                <StatusPill
                  status={statusState as "loading" | "connected" | "disconnected"}
                  label={
                    statusState === "loading"
                      ? "Checking Jobber…"
                      : statusState === "connected"
                      ? "Jobber connected"
                      : "Jobber not connected"
                  }
                />
                {lastChecked && (
                  <div className="text-xs text-slate-500">Last checked {new Date(lastChecked).toLocaleTimeString()}</div>
                )}
              </div>
              {accountLabel && (
                <div className="text-sm text-slate-700">
                  Account ID: <span className="font-mono text-slate-900">{accountLabel}</span>
                </div>
              )}
              {isError && data?.error && (
                <div className="text-sm text-red-600">Error: {data.error}</div>
              )}
              <div className="flex flex-wrap gap-2">
                <PIButton type="button" onClick={connect}>
                  {statusState === "connected" ? "Reconnect Jobber" : "Connect Jobber"}
                </PIButton>
                <PIButton variant="secondary" type="button" onClick={() => refetch()}>
                  Test sync
                </PIButton>
                <PIButton variant="tertiary" href="/admin/property-test">
                  Open Dev Console
                </PIButton>
              </div>
            </PICard>
          </div>
        </main>
      </div>
    </div>
  );
}
