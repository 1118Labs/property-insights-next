import { NextResponse } from "next/server";
import { requireAdminClient, supabaseEnabled } from "@/lib/supabase/server";
import { buildProfileFromRecord, mockProperty } from "@/lib/insights";

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return "";
      const str = typeof v === "object" ? JSON.stringify(v) : String(v);
      return `"${str.replace(/"/g, '""')}"`;
    });
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

export async function GET() {
  try {
    if (!supabaseEnabled) {
      const profile = buildProfileFromRecord(mockProperty());
      const csv = toCsv([
        {
          property_id: "mock",
          score: profile.insights.score,
          score_version: profile.insights.scoreVersion,
          breakdown: profile.insights.breakdown,
          risk_flags: profile.insights.riskFlags,
          recommendations: profile.insights.recommendations,
        },
      ]);
      return new NextResponse(csv, {
        status: 200,
        headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=insights.csv" },
      });
    }

    const admin = requireAdminClient();
    const { data, error } = await admin
      .from("property_insights")
      .select("property_id, score, score_version, breakdown, risk_flags, recommendations, enrichment_sources, enrichment_errors, enrichment_meta, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);

    if (error) throw error;

    const csv = toCsv(
      (data ?? []).map((row) => ({
        property_id: row.property_id,
        score: row.score,
        score_version: row.score_version,
        breakdown: row.breakdown,
        risk_flags: row.risk_flags,
        recommendations: row.recommendations,
        enrichment_sources: row.enrichment_sources,
        enrichment_errors: row.enrichment_errors,
        enrichment_meta: row.enrichment_meta,
        updated_at: row.updated_at,
      }))
    );

    return new NextResponse(csv, {
      status: 200,
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=insights.csv" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
