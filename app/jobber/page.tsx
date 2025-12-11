"use client";

import PIButton from "@/components/ui/PIButton";

export default function JobberConnectPage() {
  const connect = () => {
    window.location.href = "/api/jobber/authorize";
  };

  return (
    <main className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-10">
      <section className="relative overflow-hidden rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,120,246,0.06),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.06),transparent_30%)]" />
        </div>
        <div className="relative space-y-4">
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Connect Jobber to Property Insights</h1>
          <p className="text-base text-gray-700 max-w-2xl">
            Enrich your Jobber properties with AI-powered insights, aerial context, and client-ready reports — all in one clean workspace.
          </p>
          <div className="grid gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 text-sm text-gray-700">
            <Step label="Sign into Jobber" />
            <Step label="Authorize Property Insights" />
            <Step label="Start pulling client + property data" />
          </div>
          <div className="flex flex-wrap gap-3">
            <PIButton onClick={connect}>Connect Jobber</PIButton>
          </div>
        </div>
      </section>
    </main>
  );
}

function Step({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="flex h-6 w-6 items-center justify-center rounded-full border border-gray-300 bg-white text-xs font-semibold text-gray-700 shadow-sm">
        ✓
      </span>
      <span className="text-sm text-gray-700">{label}</span>
    </div>
  );
}
