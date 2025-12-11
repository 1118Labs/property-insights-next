import PIButton from "@/components/ui/PIButton";

export function HeroSection() {
  return (
    <section className="relative overflow-hidden rounded-[28px] border border-slate-200/70 bg-white/90 px-6 py-16 text-center shadow-sm backdrop-blur">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,120,246,0.08),transparent_30%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_26%)]" />
      </div>
      <div className="relative mx-auto max-w-3xl space-y-6">
        <div className="inline-flex items-center justify-center gap-2 rounded-full bg-white/80 px-4 py-2 text-xs font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200">
          Property Insights — Powered by AI
        </div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl">
          Property Insights — Powered by AI
        </h1>
        <p className="text-lg text-slate-600">
          Instant property intelligence for service pros. Connect Jobber, enrich in seconds, and share client-ready links without busywork.
        </p>
        <div className="flex items-center justify-center">
          <PIButton href="/dashboard" className="rounded-full px-6 py-3 text-sm shadow-md shadow-slate-200">
            Get Started
          </PIButton>
        </div>
      </div>
    </section>
  );
}
