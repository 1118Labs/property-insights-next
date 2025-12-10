import { headers } from "next/headers";
import { getCurrentUserFromRequest } from "@/lib/currentUser";
import { requireAdminClient } from "@/lib/supabase/server";

export default async function SystemHealthPage() {
  // Recommended fix — no manual Request construction
  const user = await getCurrentUserFromRequest();

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

  const admin = requireAdminClient();

  const { data: accounts, error: accountsError } = await admin
    .from("accounts")
    .select("*")
    .limit(50);

  const { data: usage, error: usageError } = await admin
    .from("usage_daily")
    .select("*")
    .order("day", { ascending: false })
    .limit(30);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">
            Admin
          </div>
          <h1 className="text-3xl font-bold text-white">System Health</h1>
          <p className="text-sm text-white/70">
            Overview of accounts, usage, and system performance.
          </p>
        </div>

        {/* Accounts Section */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl shadow-black/30 backdrop-blur">
          <h2 className="text-xl font-semibold text-white mb-4">Accounts</h2>

          {accountsError && (
            <div className="rounded-xl bg-red-500/20 p-3 text-red-200">
              Failed to load accounts: {accountsError.message}
            </div>
          )}

          <ul className="space-y-2 text-white/90">
            {accounts?.map((acc: any) => (
              <li key={acc.id} className="text-sm">
                {acc.business_name || "Unnamed"} — {acc.jobber_account_id}
              </li>
            ))}

            {!accounts?.length && !accountsError && (
              <li className="text-white/60 text-sm">No accounts found.</li>
            )}
          </ul>
        </div>

        {/* Usage Section */}
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl shadow-black/30 backdrop-blur">
          <h2 className="text-xl font-semibold text-white mb-4">Daily Usage</h2>

          {usageError && (
            <div className="rounded-xl bg-red-500/20 p-3 text-red-200">
              Failed to load usage: {usageError.message}
            </div>
          )}

          <ul className="space-y-2 text-white/90">
            {usage?.map((u: any) => (
              <li key={u.day} className="text-sm">
                {u.day}: {u.requests_synced} requests
              </li>
            ))}

            {!usage?.length && !usageError && (
              <li className="text-white/60 text-sm">No usage data found.</li>
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
