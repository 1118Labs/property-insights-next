"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { isAuthEnabled } from "@/lib/featureFlags";

export default function LogoutPage() {
  const router = useRouter();
  const authEnabled = isAuthEnabled();

  useEffect(() => {
    if (!authEnabled) {
      router.replace("/dashboard");
      return;
    }
    const run = async () => {
      await fetch("/api/dev/session", { method: "DELETE" });
      router.replace("/login");
    };
    run();
  }, [router, authEnabled]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] text-slate-50">
      <div className="rounded-3xl border border-white/15 bg-white/10 p-6 text-center shadow-xl shadow-black/25 backdrop-blur">
        <div className="text-lg font-semibold">Signing you out…</div>
      </div>
    </div>
  );
}
