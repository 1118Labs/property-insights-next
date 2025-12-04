import { NextResponse } from "next/server";
import {
  ensureJobberAccessToken,
  fetchRecentJobberRequests,
  ingestJobberRequests,
} from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";
import { ingestRequestSchema } from "@/lib/utils/validationSchema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const correlationId = createCorrelationId();

  try {
    const body = await request.json();
    const parsed = ingestRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: "invalid_request",
          message: parsed.error.message,
          correlationId,
        },
        { status: 400 }
      );
    }

    const limit = parsed.data.limit ?? 25;

    const token = await ensureJobberAccessToken();
    const edges = await fetchRecentJobberRequests(token.accessToken, limit);

    const result = await ingestJobberRequests(edges);

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
    console.error("Jobber ingest error:", err);

    return NextResponse.json(
      {
        error: "jobber_ingest_failed",
        message: err?.message,
        correlationId,
      },
      { status: 500 }
    );
  }
}
