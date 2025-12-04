import { NextResponse } from "next/server";
import {
  ensureJobberAccessToken,
  fetchRecentJobberRequests,
  ingestJobberRequests,
} from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";

export const runtime = "nodejs";

export async function GET() {
  const correlationId = createCorrelationId();

  try {
    const token = await ensureJobberAccessToken();
    const recent = await fetchRecentJobberRequests(token.accessToken, 25);

    const result = await ingestJobberRequests(recent);

    return NextResponse.json(
      {
        status: "ok",
        ingested: result.ingested,
        skipped: result.skipped,
        errors: result.errors,
        correlationId,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Jobber requests ingestion error:", err);

    return NextResponse.json(
      {
        error: "jobber_requests_failed",
        message: err?.message,
        correlationId,
      },
      { status: 500 }
    );
  }
}
