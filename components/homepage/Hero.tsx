import PIButton from "@/components/ui/PIButton";

export function Hero() {
  return (
    <section className="relative overflow-hidden rounded-2xl border border-gray-200 bg-white p-8 shadow-sm transition-all duration-200 ease-out hover:shadow-md">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(52,120,246,0.08),transparent_35%),radial-gradient(circle_at_80%_0%,rgba(16,185,129,0.08),transparent_30%)]" />
      </div>
      <div className="relative mx-auto flex max-w-4xl flex-col items-center gap-6 text-center">
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-gray-900 sm:text-5xl">
          Instant Property Intelligence for Service Businesses
        </h1>
        <p className="max-w-3xl text-lg text-gray-600">
          Real-time insights, aerial analysis, Jobber integration, and client-ready reports — all in one clean workspace.
        </p>
        <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <PIButton href="/dashboard" className="rounded-full px-6 py-3 text-sm shadow-md shadow-slate-200">
            Launch App
          </PIButton>
          <PIButton
            href="/jobber"
            variant="secondary"
            className="rounded-full px-6 py-3 text-sm shadow-sm shadow-slate-100"
          >
            Connect Jobber
          </PIButton>
        </div>

        <div className="mt-8 grid w-full gap-4 rounded-xl border border-gray-200 bg-white/90 p-5 text-left shadow-sm sm:grid-cols-3">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-wide text-gray-500">Property</p>
            <p className="text-base font-semibold text-gray-900">123 Harbor Lane</p>
            <p className="text-sm text-gray-600">Southold, NY</p>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm text-gray-700">
            <Metric label="Beds" value="3" />
            <Metric label="Baths" value="2.5" />
            <Metric label="Sqft" value="1,980" />
            <Metric label="Lot" value="6,500 sqft" />
          </div>
          <div className="space-y-2 text-sm">
            <p className="text-xs uppercase tracking-wide text-gray-500">Insight</p>
            <p className="rounded-lg bg-gray-50 p-3 text-gray-700 shadow-inner shadow-slate-100">
              Clean, ready-to-go overview for crews and clients — enriched automatically from your Jobber pipeline.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1 rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  );
}
