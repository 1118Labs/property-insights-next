import { requireAdminClient } from "@/lib/supabase/server";
import { getCurrentUserFromHeaders } from "@/lib/currentUser";

type EnrichmentLogRow = {
  id: string;
  jobber_request_id: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  bedrooms: number | null;
  bathrooms: number | null;
  square_feet: number | null;
  rent_estimate: number | null;
  source: string | null;
  refreshed_at: string | null;
};

export default async function EnrichmentLogPage() {
  const user = await getCurrentUserFromHeaders();

  if (!user || user.role !== "owner") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] px-6 py-10 text-slate-50">
        <div className="mx-auto max-w-3xl space-y-3 rounded-3xl border border-white/20 bg-white/10 p-6 text-center shadow-xl shadow-black/25 backdrop-blur">
          <div className="text-lg font-semibold text-white">Access denied</div>
          <div className="text-sm text-white/70">
            You need owner access to view enrichment logs.
          </div>
        </div>
      </div>
    );
  }

  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("property_enrichment")
    .select("*")
    .order("refreshed_at", { ascending: false })
    .limit(50);

  const rows = (data as EnrichmentLogRow[] | null) ?? [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#021C36]/90 via-[#0c2a49] to-[#04152b] px-6 py-10 text-slate-50">
      <div className="mx-auto max-w-5xl space-y-4">
        <div>
          <div className="text-xs uppercase tracking-[0.2em] text-white/60">
            Admin
          </div>
          <h1 className="text-3xl font-bold text-white">Enrichment Log</h1>
          <p className="text-sm text-white/70">
            Last 50 property enrichment records stored in Supabase.
          </p>
        </div>

        {error && (
          <div className="rounded-2xl border border-red-300/40 bg-red-100/20 p-4 text-red-100 shadow-lg shadow-red-900/20">
            Failed to load enrichment log: {error.message}
          </div>
        )}

        <div className="overflow-hidden rounded-3xl border border-white/15 bg-white/10 shadow-xl shadow-black/30 backdrop-blur">
          <table className="min-w-full text-left text-sm text-white/90">
            <thead className="bg-white/10 text-xs uppercase tracking-[0.18em] text-white/70">
              <tr>
                <th className="px-4 py-3">Request ID</th>
                <th className="px-4 py-3">Address</th>
                <th className="px-4 py-3">Beds/Baths</th>
                <th className="px-4 py-3">Sqft</th>
                <th className="px-4 py-3">Rent Est.</th>
                <th className="px-4 py-3">Source</th>
                <th className="px-4 py-3">Refreshed</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {rows.map((row) => (
                <tr key={row.id}>
                  <td className="px-4 py-3 font-mono text-xs text-[#14D8FF]">
                    {row.jobber_request_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-white">
                    {row.address ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    {row.bedrooms ?? "—"} bd / {row.bathrooms ?? "—"} ba
                  </td>
                  <td className="px-4 py-3">
                    {typeof row.square_feet === "number"
                      ? row.square_feet.toLocaleString()
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {typeof row.rent_estimate === "number"
                      ? `$${row.rent_estimate.toLocaleString()}`
                      : "—"}
                  </td>
                  <td className="px-4 py-3 text-xs uppercase tracking-[0.12em] text-white/70">
                    {row.source ?? "cache"}
                  </td>
                  <td className="px-4 py-3 text-xs text-white/70">
                    {row.refreshed_at
                      ? new Date(row.refreshed_at).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}

              {!rows.length && !error && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-4 py-6 text-center text-sm text-white/70"
                  >
                    No enrichment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
