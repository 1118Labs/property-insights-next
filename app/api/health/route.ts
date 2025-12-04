import { NextResponse } from "next/server";
import { isSupabaseConfigured, isJobberConfigured } from "@/lib/config";
import { getLatestJobberTokens, isTokenStale } from "@/lib/jobber";

export const runtime = "nodejs";

export async function GET() {
  try {
    const supabaseOk = isSupabaseConfigured; // BOOLEAN, not function
    const jobberOk = isJobberConfigured;     // BOOLEAN, not function

    let latestToken = null;
    let stale = null;

    try {
      latestToken = await getLatestJobberTokens();
      stale = isTokenStale(latestToken);
    } catch (err) {
      // swallow token lookup errors so health endpoint still responds
    }

    return NextResponse.json({
      status: "ok",
      supabase: supabaseOk ? "ok" : "not_configured",
      jobber: jobberOk ? "ok" : "not_configured",
      jobberTokenPresent: latestToken ? true : false,
      jobberTokenStale: stale,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        status: "error",
        message: err?.message || "unknown error",
      },
      { status: 500 }
    );
  }
}
