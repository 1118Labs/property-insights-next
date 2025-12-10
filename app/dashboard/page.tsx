"use client";

import OverviewCards from "@/components/dashboard/OverviewCards";
import RecentActivity from "@/components/dashboard/RecentActivity";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { isAuthEnabled } from "@/lib/featureFlags";
import Hint from "@/components/onboarding/Hint";
import {
  isOnboardingHintsEnabled,
  isDemoModeEnabled,
} from "@/lib/featureFlags";
import PIButton from "@/components/ui/PIButton";
import PICard from "@/components/ui/PICard";

const stats = [
  {
    label: "Today's Jobs Count",
    value: "24",
    helper: "8 in progress, 16 scheduled",
  },
  {
    label: "Total Clients Count",
    value: "312",
    helper: "5 new this week",
  },
  {
    label: "Total Properties Count",
    value: "742",
    helper: "12 added in the last 7 days",
  },
];

const activityItems = [
  {
    title: "Dispatched crew to 1258 Lakewood Dr",
    description: "Jobber sync confirmed and client notified via portal.",
    time: "5m ago",
    status: "success" as const,
  },
  {
    title: "New client imported",
    description: "Ridgeview Apartments added with 18 linked properties.",
    time: "22m ago",
    status: "info" as const,
  },
  {
    title: "Property insights rebuilt",
    description: "Re-ran aerial analysis for 88 Oak St after edits.",
    time: "1h ago",
    status: "success" as const,
  },
  {
    title: "Quote feedback received",
    description: "Client requested changes for Job #9821 (window cleaning).",
    time: "2h ago",
    status: "warning" as const,
  },
];

export default function DashboardPage() {
  const authEnabled = isAuthEnabled();
  const [authed, setAuthed] = useState<boolean>(true);
  const hintsEnabled = isOnboardingHintsEnabled();
  const demoMode = isDemoModeEnabled();
  const [showDemoHint, setShowDemoHint] = useState(false);

  useEffect(() => {
    if (!authEnabled) return;
    let cancelled = false;
    const run = async () => {
      try {
        const res = await fetch("/api/dev/me");
        const json = await res.json();
        if (!cancelled) {
          setAuthed(Boolean(json.authenticated));
        }
      } catch {
        if (!cancelled) setAuthed(false);
      }
    };

    run();
    return () => {
      cancelled = true;
    };
  }, [authEnabled]);

  useEffect(() => {
    if (!demoMode) return;
    const isDemoQuery =
      typeof window !== "undefined" &&
      window.location.search.includes("demo=true");
    const timer = window.setTimeout(() => {
      if (isDemoQuery) {
        localStorage.setItem("pi_demo_mode", "true");
      }
      setShowDemoHint(isDemoQuery);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [demoMode]);

  if (authEnabled && !authed) {
    return (
      <div className="relative min-h-screen bg-[#F5F5F7] text-[#0B1220]">
        <div className="flex min-h-screen items-center justify-center px-4">
          <PICard className="space-y-3 text-center">
            <div className="text-lg font-semibold text-[#0B1220]">Please sign in</div>
            <PIButton href="/login" className="rounded-full px-5 py-2 text-sm">
              Go to login
            </PIButton>
          </PICard>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F5F5F7] text-[#0B1220]">
      <div className="relative flex">
        <Sidebar />

        <main className="flex-1">
          <TopBar userName="Ops Team" lastSync="Last sync just now" showJobberStatus />

          <div className="mx-auto max-w-7xl space-y-8 px-6 py-10 md:px-10">
            <Image src="/brand/pi-logo.png" alt="Property Insights" width={120} height={48} className="h-8 w-auto opacity-90" />
            {hintsEnabled && (
              <Hint
                title="Start by connecting Jobber"
                body="Head to the Jobber tab to sync your requests and see real property intel."
                actionHref="/dashboard/jobber"
                actionLabel="Connect Jobber"
              />
            )}

            {showDemoHint && (
              <Hint
                title="You’re exploring in demo mode"
                body="This workspace is using demo data. Connect Jobber in a live environment to see real customers."
                actionHref="/dashboard/jobber"
                actionLabel="Exit demo"
              />
            )}

            <OverviewCards stats={stats} />

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              <PICard className="overflow-hidden rounded-[20px]">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                      Jobber Requests
                    </div>
                    <div className="text-xl font-semibold text-[#021C36]">
                      Field status at a glance
                    </div>
                  </div>

                  <span className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#021C36] ring-1 ring-[#E3E4EA]">
                    Live sync
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                  <PICard className="rounded-[16px] border px-4 py-3 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                      In Progress
                    </div>
                    <div className="text-2xl font-bold text-[#021C36]">
                      8 jobs
                    </div>
                    <div className="text-sm text-[#6B7280]">3 crews on route</div>
                  </PICard>

                  <PICard className="rounded-[16px] border px-4 py-3 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                      Scheduled
                    </div>
                    <div className="text-2xl font-bold text-[#021C36]">
                      16 jobs
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      All clients confirmed
                    </div>
                  </PICard>

                  <PICard className="rounded-[16px] border px-4 py-3 shadow-sm">
                    <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#6B7280]">
                      Issues
                    </div>
                    <div className="text-2xl font-bold text-[#021C36]">
                      2 holds
                    </div>
                    <div className="text-sm text-[#6B7280]">
                      Weather delay flagged
                    </div>
                  </PICard>
                </div>
              </PICard>

              <PICard className="rounded-[20px]">
                <RecentActivity items={activityItems} />
              </PICard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
