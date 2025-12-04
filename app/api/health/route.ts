import { NextResponse } from "next/server";
import {
  getLatestJobberTokens,
  isTokenStale,
} from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";
import { isSupabaseConfigured, isJobberConfigured } from "@/lib/config";

export const runtime = "nodejs";

export async function GET() {
  const correlationId = createCorrelationId();

  try {
    const supabaseOk = isSupabaseConfigured();
    const jobberOk = isJobberConfigured();

    const latest = await getLatestJobberTokens();
    const stale = isTokenStale(latest);

    return NextResponse.json(
      {
        supabase: supabaseOk ? "ok" : "missing",
        jobber: jobberOk ? "ok" : "missing",
        jobberToken: latest ? "present" : "missing",
        isTokenStale: stale,
        correlationId,
      },
      { status: 200 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "health_check_failed",
        message: err?.message,
        correlationId,
      },
      { status: 500 }
    );
  }
}
