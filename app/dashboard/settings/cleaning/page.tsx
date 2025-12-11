import { defaultCleaningConfig } from "@/lib/quoting/cleaning";

export default function CleaningSettingsPage() {
  const entries = Object.entries(defaultCleaningConfig);

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-slate-50 to-white px-4 py-10 text-slate-900 sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl space-y-6">
        <section className="space-y-2 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Settings</p>
          <h1 className="text-3xl font-semibold tracking-tight text-gray-900">Cleaning Service Settings</h1>
          <p className="text-sm text-slate-600">
            Configure defaults for your cleaning quotes and workflows.
          </p>
        </section>

        <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="space-y-2">
              <h2 className="text-base font-semibold text-gray-900">Defaults</h2>
              <p className="text-sm text-slate-600">
                Read-only defaults for the cleaning quoting engine. Future versions will make these editable per account.
              </p>
            </div>
            <div className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm text-slate-800">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">Key</th>
                    <th className="px-4 py-3">Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {entries.map(([key, value]) => (
                    <tr key={key} className="hover:bg-slate-50 transition">
                      <td className="px-4 py-3 font-semibold text-blue-700">{key}</td>
                      <td className="px-4 py-3 text-slate-800">
                        {typeof value === "number" ? value : String(value)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
