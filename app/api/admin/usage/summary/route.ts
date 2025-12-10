import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  if (!supabaseAdmin) {
    return NextResponse.json(
      { error: "supabase_not_configured" },
      { status: 500 }
    );
  }

  try {
    const now = new Date();
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 0, 23, 59, 59, 999));

    const { data, error } = await supabaseAdmin
      .from("usage_metrics")
      .select("metric, value")
      .gte("period_start", start.toISOString())
      .lte("period_end", end.toISOString());

    if (error) {
      return NextResponse.json(
        { error: "usage_query_failed", message: error.message },
        { status: 500 }
      );
    }

    const metrics = {
      requests_synced: 0,
      quotes_generated: 0,
      properties_enriched: 0,
    };

    (data ?? []).forEach((row) => {
      const metric = (row as { metric: string }).metric;
      const value = Number((row as { value: unknown }).value ?? 0);
      if (metric in metrics) {
        (metrics as Record<string, number>)[metric] += value;
      }
    });

    return NextResponse.json({ metrics });
  } catch (err) {
    return NextResponse.json(
      { error: "usage_summary_failed", message: String(err) },
      { status: 500 }
    );
  }
}
