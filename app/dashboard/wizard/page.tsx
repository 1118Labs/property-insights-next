"use client";

import { useMemo, useState } from "react";
import Sidebar from "@/components/dashboard/Sidebar";
import TopBar from "@/components/dashboard/TopBar";

const serviceOptions = [
  "Cleaning",
  "Pressure Washing",
  "Window Washing",
  "Lawn Care",
  "Handyman",
] as const;

const customerOptions = ["Residential", "Commercial", "Both"] as const;

const automationOptions = [
  "Request intake + qualification",
  "Property enrichment",
  "Quote generation",
  "Scheduling + reminders",
  "Client portal",
] as const;

export default function WizardPage() {
  const [step, setStep] = useState(0);
  const [service, setService] = useState<typeof serviceOptions[number] | null>(
    null
  );
  const [customer, setCustomer] = useState<typeof customerOptions[number] | null>(
    null
  );
  const [automations, setAutomations] = useState<string[]>([]);

  const summary = useMemo(
    () => ({
      service,
      customer,
      automations,
    }),
    [service, customer, automations]
  );

  const toggleAutomation = (item: string) => {
    setAutomations((prev) =>
      prev.includes(item) ? prev.filter((v) => v !== item) : [...prev, item]
    );
  };

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
          <TopBar title="Service Wizard" userName="Ops Team" subtitle="Tailor Property Insights to your trade" />
          <div className="mx-auto max-w-5xl space-y-6 px-6 py-8 md:px-10 md:py-10">
            <div className="overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 shadow-xl shadow-[#021C36]/15 backdrop-blur">
              <div className="flex items-center justify-between text-sm text-white/70">
                <div>Step {step + 1} of 4</div>
                <div className="flex gap-1">
                  {[0, 1, 2, 3].map((idx) => (
                    <span
                      key={idx}
                      className={`h-1.5 w-10 rounded-full ${
                        idx <= step ? "bg-[#14D8FF]" : "bg-white/30"
                      }`}
                    />
                  ))}
                </div>
              </div>

              {step === 0 && (
                <section className="mt-6 space-y-4">
                  <h2 className="text-2xl font-semibold text-white">
                    What type of service do you offer?
                  </h2>
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                    {serviceOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setService(option)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          service === option
                            ? "border-[#14D8FF] bg-white/20 text-white shadow-[0_18px_40px_-18px_rgba(20,216,255,0.6)]"
                            : "border-white/20 bg-white/5 text-white/80 hover:border-white/40"
                        }`}
                      >
                        <div className="text-lg font-semibold">{option}</div>
                        <div className="text-xs text-white/70">
                          Tailored flows for {option.toLowerCase()} teams.
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {step === 1 && (
                <section className="mt-6 space-y-4">
                  <h2 className="text-2xl font-semibold text-white">
                    What type of customers do you serve?
                  </h2>
                  <div className="flex flex-wrap gap-3">
                    {customerOptions.map((option) => (
                      <button
                        key={option}
                        onClick={() => setCustomer(option)}
                        className={`rounded-2xl border px-4 py-3 text-left transition ${
                          customer === option
                            ? "border-[#14D8FF] bg-white/20 text-white shadow-[0_18px_40px_-18px_rgba(20,216,255,0.6)]"
                            : "border-white/20 bg-white/5 text-white/80 hover:border-white/40"
                        }`}
                      >
                        <div className="text-lg font-semibold">{option}</div>
                        <div className="text-xs text-white/70">
                          We&apos;ll tune defaults for {option.toLowerCase()}.
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              )}

              {step === 2 && (
                <section className="mt-6 space-y-4">
                  <h2 className="text-2xl font-semibold text-white">
                    Which problems do you want automated first?
                  </h2>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                    {automationOptions.map((option) => {
                      const active = automations.includes(option);
                      return (
                        <button
                          key={option}
                          onClick={() => toggleAutomation(option)}
                          className={`rounded-2xl border px-4 py-3 text-left transition ${
                            active
                              ? "border-[#14D8FF] bg-white/20 text-white shadow-[0_18px_40px_-18px_rgba(20,216,255,0.6)]"
                              : "border-white/20 bg-white/5 text-white/80 hover:border-white/40"
                          }`}
                        >
                          <div className="text-lg font-semibold">{option}</div>
                          <div className="text-xs text-white/70">
                            Click to {active ? "remove" : "add"} this focus.
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </section>
              )}

              {step === 3 && (
                <section className="mt-6 space-y-4">
                  <h2 className="text-2xl font-semibold text-white">
                    Here&apos;s your tailored setup
                  </h2>
                  <div className="rounded-2xl border border-white/20 bg-white/10 p-4 text-sm text-white/80 shadow-inner shadow-[#021C36]/20">
                    <div className="font-semibold text-white">Summary</div>
                    <ul className="mt-2 space-y-1 list-disc pl-4">
                      <li>Service: {summary.service ?? "Not selected"}</li>
                      <li>Customers: {summary.customer ?? "Not selected"}</li>
                      <li>
                        Automations:{" "}
                        {summary.automations.length
                          ? summary.automations.join(", ")
                          : "None selected"}
                      </li>
                    </ul>
                    <div className="mt-3 text-xs text-white/60">
                      We&apos;ll use these to configure quoting, enrichment, and workflows. (Logged to console for now.)
                    </div>
                  </div>
                </section>
              )}

              <div className="mt-8 flex items-center justify-between">
                <button
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  disabled={step === 0}
                  className="rounded-full border border-white/40 bg-white/10 px-4 py-2 text-sm font-semibold text-white/80 shadow-sm shadow-[#021C36]/20 transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Back
                </button>
                {step < 3 ? (
                  <button
                    onClick={() => setStep((s) => Math.min(3, s + 1))}
                    className="rounded-full bg-[#14D8FF] px-5 py-2 text-sm font-semibold text-[#021C36] shadow-[0_14px_32px_-20px_rgba(20,216,255,0.8)] transition hover:-translate-y-0.5"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    onClick={() => console.log("Wizard summary", summary)}
                    className="rounded-full bg-emerald-400 px-5 py-2 text-sm font-semibold text-emerald-950 shadow-[0_14px_32px_-20px_rgba(52,211,153,0.6)] transition hover:-translate-y-0.5"
                  >
                    Finish
                  </button>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
