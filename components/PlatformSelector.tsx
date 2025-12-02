"use client";

import { useEffect, useState } from "react";

type Option = { slug: string; name: string; configured: boolean; health?: { status: string; detail?: string } };

export function PlatformSelector() {
  const [active, setActive] = useState<string>("jobber");
  const [options, setOptions] = useState<Option[]>([]);
  const [status, setStatus] = useState<string>("");

  const load = async () => {
    const res = await fetch("/api/platform-config");
    const body = await res.json().catch(() => ({}));
    setActive(body.data?.active || "jobber");
    setOptions(body.data?.options || []);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load();
  }, []);

  const select = async (slug: string) => {
    setStatus("Saving…");
    const res = await fetch("/api/platform-config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform: slug }),
    });
    const body = await res.json().catch(() => ({}));
    if (res.ok) {
      setActive(body.data?.active || slug);
      setStatus("Saved");
    } else {
      setStatus(body.message || "Failed");
    }
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-slate-900 dark:text-white">Service platform</p>
        <span className="text-[11px] text-slate-500 dark:text-slate-300">Select your provider</span>
      </div>
      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
        {options.map((opt) => {
          const disabled = !opt.configured && opt.slug !== "jobber";
          return (
            <button
              key={opt.slug}
              disabled={disabled}
              onClick={() => select(opt.slug)}
              className={`rounded-lg border px-3 py-2 text-left text-sm transition ${
                active === opt.slug
                  ? "border-emerald-500 bg-emerald-50 text-emerald-800 dark:border-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-100"
                  : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100"
              } ${disabled ? "opacity-60" : ""}`}
            >
              <div className="font-semibold">{opt.name}</div>
              <div className="text-[11px] text-slate-500 dark:text-slate-300">{disabled ? "Env vars missing" : "Ready"}</div>
            </button>
          );
        })}
      </div>
      {status && <p className="mt-2 text-xs text-slate-500 dark:text-slate-300">{status}</p>}
    </div>
  );
}
