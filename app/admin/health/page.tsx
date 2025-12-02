"use client";

import { useEffect, useState } from "react";
import { WebhookSimulator } from "@/components/WebhookSimulator";
import { IngestionEventsList } from "@/components/IngestionEventsList";
import { AddressNormalizePreview } from "@/components/AddressNormalizePreview";
import { HealthStatusBanner } from "@/components/HealthStatusBanner";

type Health = {
  status: string;
  supabase?: { status: string };
  jobber?: { status: string; daysRemaining?: number | null };
  providers?: Array<{ label: string; circuitOpen?: boolean }>;
};

export default function AdminHealthPage() {
  const [health, setHealth] = useState<Health | null>(null);

  useEffect(() => {
    fetch("/api/health")
      .then((res) => res.json())
      .then((body) => setHealth(body))
      .catch(() => {});
  }, []);

  return (
    <div className="space-y-4">
      {health && (
        <HealthStatusBanner
          status={health.status}
          supabase={health.supabase?.status}
          jobber={health.jobber?.status}
          providerCount={health.providers?.length}
          detail={health.jobber?.daysRemaining !== undefined ? `Token days: ${health.jobber?.daysRemaining ?? "n/a"}` : undefined}
        />
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Webhook simulator</p>
          <WebhookSimulator />
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
          <p className="text-sm font-semibold text-slate-900 dark:text-white">Address normalization</p>
          <AddressNormalizePreview />
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Recent ingestion events</p>
        <IngestionEventsList limit={15} />
      </div>
    </div>
  );
}
