async function fetchStatus() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/jobber/status`, {
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return { connected: false, error: "Failed to load status" };
  }
}

async function fetchUsage() {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || ""}/api/admin/usage/summary`, {
      cache: "no-store",
    });
    return await res.json();
  } catch {
    return { metrics: null, error: "Failed to load usage" };
  }
}

import { headers } from "next/headers";
import { getCurrentUserFromRequest } from "@/lib/currentUser";

export default async function SystemHealthPage() {
  const user = await getCurrentUserFromRequest(
    new Request("http://local", { headers: headers() })
  );

  if (!user || user.role !== "owner") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] px-6 py-10 text-slate-50">
        <div className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-xl shadow-black/25 backdrop-blur">
          <div className="text-lg font-semibold text-white">Access denied</div>
          <div className="text-sm text-white/70">
            You need owner access to view system health.
          </div>
        </div>
      </div>
    );
  }

  const [status, usage] = await Promise.all([fetchStatus(), fetchUsage()]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">
            Admin
          </div>
          <h1 className="text-3xl font-bold text-white">System health</h1>
          <p className="text-sm text-white/70">
            Connection status, usage snapshot, and sync signals.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-xl shadow-black/25 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">
              Jobber connection
            </div>
            <div className="mt-2 text-2xl font-bold text-white">
              {status.connected ? "Connected" : "Not connected"}
            </div>
            <div className="text-xs text-white/70">
              {status.connected
                ? `Account: ${status.jobber_account_id ?? "unknown"}`
                : status.error ?? "Check Jobber tokens"}
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-xl shadow-black/25 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">
              Last sync
            </div>
            <div className="mt-2 text-2xl font-bold text-white">Manual</div>
            <div className="text-xs text-white/70">
              Cron sync endpoint available (/api/cron/sync-jobber-requests).
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-xl shadow-black/25 backdrop-blur">
            <div className="text-xs uppercase tracking-[0.18em] text-white/60">
              Usage snapshot (month)
            </div>
            <div className="mt-2 space-y-1 text-sm text-white/80">
              <div>Requests synced: {usage.metrics?.requests_synced ?? "—"}</div>
              <div>Quotes generated: {usage.metrics?.quotes_generated ?? "—"}</div>
              <div>Properties enriched: {usage.metrics?.properties_enriched ?? "—"}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
