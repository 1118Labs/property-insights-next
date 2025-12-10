"use client";

import { useState } from "react";
import { isAuthEnabled } from "@/lib/featureFlags";

export default function LoginPage() {
  const authEnabled = isAuthEnabled();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setMessage(null);
    try {
      const res = await fetch("/api/dev/session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json();
      if (json.ok) {
        setMessage("Magic link simulated. You are now logged in.");
      } else {
        setMessage(json.error || "Failed to log in.");
      }
    } catch (err) {
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  };

  if (!authEnabled) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] text-slate-50">
        <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center shadow-xl shadow-black/25 backdrop-blur">
          <div className="text-lg font-semibold">Auth is disabled in this environment.</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] text-slate-50">
      <div className="w-full max-w-md space-y-6 rounded-3xl border border-white/15 bg-white/10 p-6 shadow-xl shadow-black/25 backdrop-blur">
        <div className="text-center">
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">
            Property Insights
          </div>
          <h1 className="text-2xl font-bold text-white">Sign in</h1>
          <p className="text-sm text-white/70">
            Enter your email to receive a magic link (dev-only simulation).
          </p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-2xl border border-white/20 bg-white/80 px-4 py-3 text-sm text-[#021C36] shadow-inner shadow-[#021C36]/10 focus:border-[#14D8FF]"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-full bg-[#14D8FF] px-4 py-3 text-sm font-semibold text-[#021C36] shadow-[0_14px_32px_-20px_rgba(20,216,255,0.8)] transition hover:-translate-y-0.5 disabled:opacity-60"
          >
            {loading ? "Sending…" : "Send magic link"}
          </button>
        </form>
        {message && (
          <div className="rounded-xl border border-white/20 bg-white/10 p-3 text-sm text-white/80">
            {message}
          </div>
        )}
      </div>
    </div>
  );
}
