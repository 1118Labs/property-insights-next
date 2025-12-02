import { NextResponse } from "next/server";
import { requireAdminClient, supabaseEnabled } from "@/lib/supabase/server";
import { mockProperty } from "@/lib/insights";

function toCsv(rows: Record<string, unknown>[]) {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  for (const row of rows) {
    const values = headers.map((h) => {
      const v = row[h];
      if (v === null || v === undefined) return "";
      const str = Array.isArray(v) ? v.join("|") : String(v);
      return `"${str.replace(/"/g, '""')}"`;
    });
    lines.push(values.join(","));
  }
  return lines.join("\n");
}

export async function GET() {
  try {
    if (!supabaseEnabled) {
      const sample = mockProperty();
      const csv = toCsv([
        {
          id: "mock",
          line1: sample.address.line1,
          line2: sample.address.line2,
          city: sample.address.city,
          province: sample.address.province,
          postal_code: sample.address.postalCode,
          country: sample.address.country,
          beds: sample.beds,
          baths: sample.baths,
          sqft: sample.sqft,
          lot_size_sqft: sample.lotSizeSqft,
          year_built: sample.yearBuilt,
          updated_at: sample.updatedAt,
        },
      ]);
      return new NextResponse(csv, {
        status: 200,
        headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=properties.csv" },
      });
    }

    const admin = requireAdminClient();
    const { data, error } = await admin
      .from("properties")
      .select(
        "id, jobber_property_id, address_line1, address_line2, city, province, postal_code, country, beds, baths, sqft, lot_size_sqft, year_built, updated_at"
      )
      .limit(500);
    if (error) throw error;

    const rows =
      data?.map((row) => ({
        id: row.id,
        jobber_property_id: row.jobber_property_id,
        line1: row.address_line1,
        line2: row.address_line2,
        city: row.city,
        province: row.province,
        postal_code: row.postal_code,
        country: row.country,
        beds: row.beds,
        baths: row.baths,
        sqft: row.sqft,
        lot_size_sqft: row.lot_size_sqft,
        year_built: row.year_built,
        updated_at: row.updated_at,
      })) ?? [];

    const csv = toCsv(rows);
    return new NextResponse(csv, {
      status: 200,
      headers: { "Content-Type": "text/csv", "Content-Disposition": "attachment; filename=properties.csv" },
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
