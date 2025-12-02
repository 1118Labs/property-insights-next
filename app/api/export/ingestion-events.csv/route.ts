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
    const { data, error } = await admin.from("ingestion_events").select("*").order("created_at", { ascending: false }).limit(500);
    if (error) throw error;
    const csv = toCsv(data ?? []);
    return new NextResponse(csv, { status: 200, headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=ingestion_events.csv" } });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
