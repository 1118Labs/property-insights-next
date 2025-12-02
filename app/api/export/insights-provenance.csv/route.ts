import { NextResponse } from "next/server";
import { requireAdminClient, supabaseEnabled } from "@/lib/supabase/server";

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
      return new NextResponse("", { status: 200, headers: { "Content-Type": "text/csv" } });
    }
    const admin = requireAdminClient();
    const { data, error } = await admin
      .from("property_insights")
      .select("property_id, score, enrichment_sources, enrichment_errors, enrichment_meta, updated_at")
      .order("updated_at", { ascending: false })
      .limit(500);
    if (error) throw error;
    const csv = toCsv(
      (data ?? []).map((row) => ({
        property_id: row.property_id,
        score: row.score,
        sources: row.enrichment_sources,
        errors: row.enrichment_errors,
        meta: row.enrichment_meta,
        updated_at: row.updated_at,
      }))
    );
    return new NextResponse(csv, {
      status: 200,
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=insights_provenance.csv" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
