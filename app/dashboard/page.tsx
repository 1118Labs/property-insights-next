"use client";

import RecentActivity from "@/components/dashboard/RecentActivity";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";
import DashboardStats from "@/components/dashboard/DashboardStats";
import SectionHeader from "@/components/dashboard/SectionHeader";
import ReportCard from "@/components/dashboard/ReportCard";
import { useEffect, useState } from "react";
import { isAuthEnabled } from "@/lib/featureFlags";
import Hint from "@/components/onboarding/Hint";
import { isOnboardingHintsEnabled, isDemoModeEnabled } from "@/lib/featureFlags";
import PIButton from "@/components/ui/PIButton";
import PICard from "@/components/ui/PICard";
import {
  ChartPieIcon,
  ClipboardDocumentCheckIcon,
  HeartIcon,
  ShieldCheckIcon,
  SignalIcon,
} from "@heroicons/react/24/outline";

const stats = [
  {
    label: "Total Properties",
    value: "742",
    helper: "12 added this week",
  },
  {
    label: "Total Requests",
    value: "312",
    helper: "5 new this week",
  },
  {
    label: "Completed Jobs",
    value: "186",
    helper: "Last 30 days",
  },
  {
    label: "Active Quotes",
    value: "42",
    helper: "Awaiting approval",
  },
  {
    label: "Sync Status",
    value: "Healthy",
    helper: "Jobber connected",
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

  const reports = [
    {
      title: "Property Health Report",
      description: "See quality, valuation, and risk signals across your portfolio.",
      href: "/admin/property-health",
      icon: HeartIcon,
    },
    {
      title: "Provider Health Diagnostics",
      description: "Monitor provider reliability and upstream circuit status.",
      href: "/admin/providers",
      icon: ShieldCheckIcon,
    },
    {
      title: "Enrichment Log",
      description: "Review enrichment runs, source quality, and fallbacks.",
      href: "/admin/enrichment-log",
      icon: ClipboardDocumentCheckIcon,
    },
    {
      title: "Usage & API Metrics",
      description: "Track volume, performance, and consumption trends.",
      href: "/admin/status",
      icon: SignalIcon,
    },
    {
      title: "System Health",
      description: "Check platform status, uptime, and recent issues.",
      href: "/admin/system-health",
      icon: ChartPieIcon,
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-white via-slate-50 to-white text-[#0B1220]">
      <div className="relative flex">
        <Sidebar />

        <main className="flex-1">
          <TopBar userName="Ops Team" lastSync="Last sync just now" showJobberStatus />

          <div className="mx-auto max-w-6xl space-y-8 px-6 py-10">
            <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white px-6 py-6 sm:px-10 sm:py-8 shadow-sm">
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,120,246,0.06),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.06),transparent_30%)]" />
              </div>
              <div className="relative space-y-2">
                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Dashboard</h1>
                <p className="text-sm text-gray-600">Your workspace overview</p>
              </div>
            </section>

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

            <div className="space-y-4">
              <SectionHeader title="Stats" subtitle="Key signals across your workspace" />
              <DashboardStats stats={stats} />
            </div>

            <div className="space-y-4">
              <SectionHeader title="Reports" subtitle="Deep dives for health, usage, and quality" />
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {reports.map((report) => (
                  <ReportCard key={report.title} {...report} />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <SectionHeader title="Recent Activity" subtitle="Latest events across requests and insights" />
              <PICard>
                <RecentActivity items={activityItems} />
              </PICard>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
