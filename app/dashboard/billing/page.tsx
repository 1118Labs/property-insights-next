"use client";

import PIButton from "@/components/ui/PIButton";
import SectionHeader from "@/components/ui/SectionHeader";
import { useMemo } from "react";

export default function BillingPage() {
  const usage = useMemo(() => {
    const used = 4200;
    const limit = 10000;
    const percent = Math.min(100, Math.round((used / limit) * 100));
    return { used, limit, percent };
  }, []);

  return (
    <main className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-10">
      <section className="rounded-3xl border border-slate-200 bg-white px-6 py-6 shadow-sm sm:px-10 sm:py-8">
        <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Billing & Plan</h1>
        <p className="text-sm text-gray-600">Manage your subscription, invoices, and usage.</p>
      </section>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Current Plan" subtitle="Your active subscription" />
          <div className="space-y-2">
            <p className="text-2xl font-semibold text-gray-900">Developer (Local)</p>
            <p className="text-sm text-gray-600">Unlimited local development. Billing not active in this build.</p>
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Requests sync: dev tier</span>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1">Quotes: unlimited (local)</span>
            </div>
          </div>
          <PIButton href="mailto:sales@propertyinsights.dev">Contact Sales</PIButton>
          <p className="text-xs text-gray-500">Stripe integration is not active in this build. Add keys later to enable live billing.</p>
        </section>

        <section className="space-y-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <SectionHeader title="Usage & Limits" subtitle="Monthly workspace activity" />
          <div className="space-y-2">
            <p className="text-sm text-gray-700">
              {usage.used.toLocaleString()} / {usage.limit.toLocaleString()} requests this month
            </p>
            <div className="h-3 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-blue-500 transition-all"
                style={{ width: `${usage.percent}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">Auto-resets monthly. Contact sales if you need higher limits.</p>
          </div>
        </section>
      </div>

      <section className="space-y-3 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
        <SectionHeader title="Invoices" subtitle="Billing history" />
        <p className="text-sm text-gray-600">Invoice syncing is not yet enabled for this account.</p>
        <PIButton href="mailto:support@propertyinsights.dev" variant="secondary" className="w-fit">
          Request invoice export
        </PIButton>
      </section>
    </main>
  );
}
