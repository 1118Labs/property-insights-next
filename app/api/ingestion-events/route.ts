import { NextResponse } from "next/server";
import { requireAdminClient, supabaseEnabled } from "@/lib/supabase/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";

export async function GET(req: Request) {
  const correlationId = createCorrelationId();
  try {
    if (!supabaseEnabled) {
      return NextResponse.json({ data: [], count: 0, correlationId });
    }
    const admin = requireAdminClient();
    const url = new URL(req.url);
    const source = url.searchParams.get("source");
    const status = url.searchParams.get("status");
    const platform = url.searchParams.get("platform");
    const since = url.searchParams.get("since");
    const limit = Number(url.searchParams.get("limit") || 50);
    const offset = Number(url.searchParams.get("offset") || 0);
    const sort = url.searchParams.get("sort") || "created_at";
    const direction = url.searchParams.get("direction") === "asc" ? "asc" : "desc";
    const search = url.searchParams.get("q");

    let query = admin
      .from("ingestion_events")
      .select("*", { count: "exact" })
      .order(sort, { ascending: direction === "asc" })
      .limit(Math.min(limit, 200))
      .range(offset, offset + Math.min(limit, 200) - 1);
    if (source) query = query.eq("source", source);
    if (status) query = query.eq("status", status);
    if (platform) query = query.eq("platform", platform);
    if (since) query = query.gte("created_at", since);
    if (search) query = query.ilike("detail::text", `%${search}%`);

    const { data, error, count } = await query;
    if (error) throw error;

    return NextResponse.json({ data, count, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
