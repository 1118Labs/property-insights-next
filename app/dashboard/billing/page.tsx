"use client";

import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

export default function BillingPage() {
  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] text-slate-50">
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 16% 20%, rgba(20,216,255,0.18), transparent 28%), radial-gradient(circle at 82% 12%, rgba(255,255,255,0.08), transparent 24%), radial-gradient(circle at 70% 70%, rgba(2,28,54,0.35), transparent 42%)",
        }}
      />
      <div className="relative flex">
        <Sidebar />
        <main className="flex-1">
          <TopBar title="Billing & Plans" userName="Ops Team" subtitle="Plan overview and upcoming billing" />
          <div className="mx-auto max-w-5xl space-y-6 px-6 py-8 md:px-10 md:py-10">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl shadow-[#021C36]/15 backdrop-blur">
              <div className="text-xs uppercase tracking-[0.18em] text-white/60">
                Current plan
              </div>
              <div className="mt-2 text-2xl font-bold text-white">Developer (Local)</div>
              <p className="mt-1 text-sm text-white/70">
                Unlimited local development. Live billing is not active in this build.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-sm text-white/80">
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                  Requests sync: dev tier
                </span>
                <span className="rounded-full border border-white/20 bg-white/10 px-3 py-1">
                  Quotes: unlimited (local)
                </span>
              </div>
              <button
                disabled
                className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/20 px-5 py-2 text-sm font-semibold text-white/60 shadow-sm shadow-[#021C36]/20"
              >
                Upgrade to Pro (coming soon)
              </button>
              <div className="mt-3 text-xs text-white/60">
                Stripe integration is not active in this build. Add keys later to enable live billing.
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
