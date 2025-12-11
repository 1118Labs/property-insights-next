"use client";

import { useState } from "react";
import Link from "next/link";
import PIButton from "@/components/ui/PIButton";

type SettingsDrawerProps = {
  open: boolean;
  onClose: () => void;
};

export default function SettingsDrawer({ open, onClose }: SettingsDrawerProps) {
  const [propertyUpdates, setPropertyUpdates] = useState(true);
  const [syncSummaries, setSyncSummaries] = useState(false);

  if (!open) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <aside className="fixed right-0 top-0 z-50 flex h-screen w-full max-w-[480px] flex-col border-l border-slate-200 bg-white shadow-xl">
        <div className="flex items-center justify-between px-5 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Quick Settings</h2>
            <p className="text-sm text-slate-600">
              Adjust key workspace settings without leaving your page.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-100"
            aria-label="Close settings"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-auto px-5 pb-6">
          <Section title="Workspace">
            <p className="text-sm text-slate-700">Property Insights Workspace</p>
            <p className="text-xs text-slate-500">Admin: ops@propertyinsights.dev</p>
          </Section>

          <Section title="Notifications">
            <ToggleRow
              label="Property updates"
              description="Email me when property insights refresh."
              enabled={propertyUpdates}
              onChange={setPropertyUpdates}
            />
            <ToggleRow
              label="Jobber sync summaries"
              description="Daily summary of synced requests."
              enabled={syncSummaries}
              onChange={setSyncSummaries}
            />
          </Section>

          <Section title="Links">
            <div className="space-y-2">
              <PIButton href="/dashboard/settings/cleaning" variant="secondary" className="w-full justify-center">
                Open full Settings
              </PIButton>
              <PIButton href="/dashboard/billing" variant="secondary" className="w-full justify-center">
                Open Billing
              </PIButton>
            </div>
          </Section>
        </div>
      </aside>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <p className="text-xs uppercase tracking-wide text-slate-500">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

function ToggleRow({
  label,
  description,
  enabled,
  onChange,
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-3 py-2 shadow-sm">
      <div>
        <p className="text-sm font-semibold text-slate-900">{label}</p>
        <p className="text-xs text-slate-500">{description}</p>
      </div>
      <label className="relative inline-flex cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={enabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <div className="peer h-5 w-9 rounded-full border border-slate-300 bg-slate-200 transition peer-checked:border-blue-500 peer-checked:bg-blue-500" />
        <div className="absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-4" />
      </label>
    </div>
  );
}
