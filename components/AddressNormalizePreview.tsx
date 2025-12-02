"use client";
import { useMemo, useState } from "react";
import { normalizeAddressWithDiagnostics } from "@/lib/utils/address";

type Props = { initial?: { line1?: string; city?: string; province?: string; postalCode?: string; country?: string } };

export function AddressNormalizePreview({ initial }: Props) {
  const [input, setInput] = useState<{ line1: string; city: string; province: string; postalCode: string; country: string }>({
    line1: initial?.line1 || "",
    city: initial?.city || "",
    province: initial?.province || "",
    postalCode: initial?.postalCode || "",
    country: initial?.country || "",
  });

  const diagnostics = useMemo(() => normalizeAddressWithDiagnostics(input), [input]);

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-700 shadow-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {(["line1", "city", "province", "postalCode", "country"] as const).map((field) => (
          <label key={field} className="text-xs uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {field}
            <input
              className="mt-1 w-full rounded-lg border border-slate-200 px-2 py-1 text-sm text-slate-900 dark:border-slate-600 dark:bg-slate-700 dark:text-slate-100"
              value={input[field] || ""}
              onChange={(e) => setInput((prev) => ({ ...prev, [field]: e.target.value }))}
              placeholder={field === "line1" ? "123 Harbor Ln" : ""}
            />
          </label>
        ))}
      </div>

      <div className="rounded-lg border border-slate-100 bg-slate-50 p-3 text-xs text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200">
        <p className="font-semibold text-slate-900 dark:text-white">Normalized</p>
        <p className="mt-1 text-slate-700 dark:text-slate-200">{diagnostics.formatted || "—"}</p>
      </div>

      {(diagnostics.missing.length || diagnostics.warnings.length) ? (
        <div className="flex flex-wrap gap-2 text-[11px]">
          {diagnostics.missing.map((m) => (
            <span key={m} className="rounded-full bg-rose-100 px-2 py-1 font-semibold text-rose-700 dark:bg-rose-900/50 dark:text-rose-200">Missing {m}</span>
          ))}
          {diagnostics.warnings.map((w) => (
            <span key={w} className="rounded-full bg-amber-100 px-2 py-1 font-semibold text-amber-800 dark:bg-amber-900/50 dark:text-amber-200">{w}</span>
          ))}
        </div>
      ) : (
        <p className="text-xs text-emerald-700 dark:text-emerald-300">Address looks good.</p>
      )}
    </div>
  );
}
