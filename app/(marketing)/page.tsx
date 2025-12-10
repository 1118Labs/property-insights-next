"use client";

import Link from "next/link";
import { isMarketingSiteEnabled } from "@/lib/featureFlags";

const features = [
  { title: "Auto-enriched properties", body: "Beds, baths, sqft, coordinates, and value estimates automatically pulled in." },
  { title: "Service-specific quoting", body: "Cleaning, pressure washing, windows, lawn care, and handyman engines built-in." },
  { title: "Jobber integration", body: "Sync requests and enrich them without leaving your flow." },
  { title: "Crew-ready summaries", body: "Give ops the intel they need to route and schedule with confidence." },
];

export default function MarketingPage() {
  if (!isMarketingSiteEnabled()) {
    return (
      <div className="flex min-h-screen items-center justify-center text-white">
        Marketing site is disabled.
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden
        style={{
          background:
            "radial-gradient(circle at 16% 20%, rgba(20,216,255,0.18), transparent 28%), radial-gradient(circle at 82% 12%, rgba(255,255,255,0.08), transparent 24%), radial-gradient(circle at 70% 70%, rgba(2,28,54,0.35), transparent 42%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-8 py-6 text-sm text-white/80">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-[#14D8FF] via-white to-[#021C36] text-lg font-black text-[#021C36]">
            PI
          </div>
          <div className="text-base font-semibold text-white">Property Insights</div>
        </div>
        <nav className="flex items-center gap-6">
          <a href="#product" className="hover:text-white">Product</a>
          <a href="#pricing" className="hover:text-white">Pricing</a>
          <a href="#docs" className="hover:text-white">Docs</a>
          <Link
            href="/login"
            className="rounded-full border border-white/20 bg-white/10 px-4 py-1.5 text-sm font-semibold text-white hover:-translate-y-0.5 hover:border-[#14D8FF]/60 hover:bg-[#14D8FF]/20"
          >
            Sign in
          </Link>
        </nav>
      </header>

      <main className="relative z-10 px-8 pb-16">
        <section className="mx-auto max-w-5xl space-y-8 pt-10 text-white" id="product">
          <div className="max-w-3xl space-y-4">
            <h1 className="text-4xl font-bold leading-tight md:text-5xl">
              Property Insights for Service Businesses
            </h1>
            <p className="text-lg text-white/80">
              Turn raw addresses into instant quotes and crew-ready intel.
              Built for operators who need speed, accuracy, and polish.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/dashboard?demo=true"
                className="inline-flex items-center gap-2 rounded-full bg-[#14D8FF] px-5 py-2 text-sm font-semibold text-[#021C36] shadow-[0_18px_40px_-18px_rgba(20,216,255,0.8)] transition hover:-translate-y-0.5"
              >
                Try live demo
              </Link>
              <a
                href="#screens"
                className="inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-[#021C36]/30 transition hover:-translate-y-0.5"
              >
                View dashboard screenshots
              </a>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-12 grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2" id="features">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-xl shadow-black/20 backdrop-blur"
            >
              <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
                {feature.title}
              </div>
              <div className="mt-2 text-base text-white/80">{feature.body}</div>
            </div>
          ))}
        </section>

        <section className="mx-auto mt-12 max-w-5xl space-y-4" id="screens">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            Screenshots
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {[1, 2].map((card) => (
              <div
                key={card}
                className="h-64 rounded-3xl border border-white/15 bg-gradient-to-br from-white/15 via-white/5 to-[#021C36]/30 shadow-xl shadow-black/25"
              />
            ))}
          </div>
        </section>

        <section className="mx-auto mt-12 max-w-5xl space-y-6" id="pricing">
          <div className="text-sm font-semibold uppercase tracking-[0.2em] text-white/60">
            Pricing
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { title: "Developer Preview", price: "Free", note: "Full local/demo experience." },
              { title: "Pro", price: "Coming soon", note: "Higher sync limits and team access." },
              { title: "Enterprise", price: "Talk to us", note: "Custom routing, SSO, SLAs." },
            ].map((plan) => (
              <div
                key={plan.title}
                className="rounded-3xl border border-white/15 bg-white/10 p-5 text-white shadow-xl shadow-black/25 backdrop-blur"
              >
                <div className="text-lg font-semibold">{plan.title}</div>
                <div className="text-2xl font-bold">{plan.price}</div>
                <div className="text-sm text-white/70">{plan.note}</div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
