export default function ServiceTypesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-4xl space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">
            Service types
          </div>
          <h1 className="text-3xl font-bold text-white">Multi-trade directory</h1>
          <p className="text-sm text-white/70">
            Placeholder for managing trade configurations. Coming soon.
          </p>
        </div>
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-white/80 shadow-xl shadow-black/25 backdrop-blur">
          Future interface for configuring trade-specific defaults.
        </div>
      </div>
    </div>
  );
}
