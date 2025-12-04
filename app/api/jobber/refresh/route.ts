import { NextResponse } from "next/server";
import {
  getLatestJobberTokens,
  refreshJobberToken,
  storeJobberTokens,
} from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";

export const runtime = "nodejs";

export async function GET() {
  const correlationId = createCorrelationId();

  try {
    const latest = await getLatestJobberTokens();
    if (!latest?.refresh_token) {
      return NextResponse.json(
        {
          error: "no_refresh_token",
          message: "No Jobber refresh token is available.",
          correlationId,
        },
        { status: 400 }
      );
    }

    const refreshed = await refreshJobberToken(latest.refresh_token);

    await storeJobberTokens({
      ...refreshed,
      jobber_account_id: latest.jobber_account_id,
    });

    return NextResponse.json(
      {
        status: "ok",
        refreshed: true,
        correlationId,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Jobber refresh error:", err);

    return NextResponse.json(
      {
        error: "jobber_refresh_failed",
        message: err?.message,
        correlationId,
      },
      { status: 500 }
    );
  }
}
