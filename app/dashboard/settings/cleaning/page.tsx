import { defaultCleaningConfig } from "@/lib/quoting/cleaning";

export default function CleaningSettingsPage() {
  const entries = Object.entries(defaultCleaningConfig);

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-4xl space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">
            Settings
          </div>
          <h1 className="text-3xl font-bold text-white">Cleaning engine config</h1>
          <p className="text-sm text-white/70">
            Read-only defaults for the cleaning quoting engine. Future versions will make these editable per account.
          </p>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-xl shadow-black/30 backdrop-blur">
          <table className="min-w-full text-left text-sm text-white/90">
            <thead className="bg-white/10 text-xs uppercase tracking-[0.18em] text-white/70">
              <tr>
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Value</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {entries.map(([key, value]) => (
                <tr key={key}>
                  <td className="px-4 py-3 font-semibold text-[#14D8FF]">{key}</td>
                  <td className="px-4 py-3 text-white">
                    {typeof value === "number" ? value : String(value)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
