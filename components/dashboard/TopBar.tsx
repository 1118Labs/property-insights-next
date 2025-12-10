"use client";

import { useEffect, useState } from "react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import Image from "next/image";
import PIButton from "../ui/PIButton";
import StatusPill from "../ui/StatusPill";

type TopBarProps = {
  title?: string;
  userName?: string;
  lastSync?: string;
  subtitle?: string;
  showJobberStatus?: boolean;
};

type JobberStatus = {
  connected?: boolean;
};

export function TopBar({
  title = "Dashboard",
  userName = "Ops Team",
  lastSync = "Last sync just now",
  subtitle = "Operational intelligence for your service business.",
  showJobberStatus = true,
}: TopBarProps) {
  const [jobberStatus, setJobberStatus] = useState<"loading" | "connected" | "disconnected">("loading");

  useEffect(() => {
    if (!showJobberStatus) return;

    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch("/api/jobber/status", { cache: "no-store" });
        const json = (await res.json()) as JobberStatus;
        if (!cancelled) {
          setJobberStatus(json.connected ? "connected" : "disconnected");
        }
      } catch {
        if (!cancelled) setJobberStatus("disconnected");
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, [showJobberStatus]);

  const initials =
    userName
      .split(" ")
      .map((part) => part[0])
      .join("")
      .slice(0, 2) || "PI";

  return (
    <header className="sticky top-0 z-10 w-full border-b border-slate-200 bg-white px-6 py-3 text-slate-900 shadow-sm md:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <Image src="/brand/pi-logo.png" alt="Property Insights" width={32} height={32} />
        <div className="space-y-1">
          <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-gray-500">
            Property Insights
          </div>
          <div className="text-2xl font-semibold text-slate-900">{title}</div>
          <p className="text-sm text-gray-600">{subtitle}</p>
          {lastSync && (
            <div className="text-xs text-gray-500">{lastSync}</div>
          )}
        </div>
      </div>
      <div className="flex items-center gap-3">
        {showJobberStatus && (
          <div className="flex items-center gap-2">
            <StatusPill
              status={jobberStatus}
              label={
                jobberStatus === "loading"
                  ? "Checking Jobber…"
                  : jobberStatus === "connected"
                  ? "Jobber connected"
                  : "Jobber not connected"
              }
            />
            <PIButton
              type="button"
              onClick={() => {
                window.location.href = "/dashboard/jobber";
              }}
              variant="primary"
              className="px-4 py-2"
            >
              {jobberStatus === "connected" ? "Manage Jobber" : "Connect Jobber"}
            </PIButton>
          </div>
        )}
        <PIButton
          type="button"
          variant="secondary"
          onClick={() => {
            window.location.reload();
          }}
          className="gap-2"
        >
          <ArrowPathIcon className="h-4 w-4" aria-hidden />
          Refresh
        </PIButton>
        <div className="flex h-11 w-11 items-center justify-center rounded-full border border-gray-200 bg-white text-sm font-semibold uppercase text-[#021C36] shadow-sm">
          {initials}
        </div>
      </div>
    </header>
  );
}

export default TopBar;
