import { NextResponse } from "next/server";
import { fetchRecentJobberRequests, ingestJobberRequests, ensureJobberAccessToken } from "@/lib/jobber";
import { supabaseEnabled } from "@/lib/supabase/server";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";
import { assertAdminAuthorized } from "@/lib/utils/auth";
import { assertNotSafeMode } from "@/lib/config";

export async function GET(req: Request) {
  const correlationId = createCorrelationId();
  if (!rateLimitGuard("api:jobber-requests", 10, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many requests", correlationId });
  }
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    const status = (err as { status?: number } | undefined)?.status ?? 401;
    return jsonError(status, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  try {
    if (!supabaseEnabled) {
      return jsonError(400, { errorCode: "SUPABASE_DISABLED", message: "Supabase not configured; Jobber tokens unavailable.", correlationId });
    }

    assertNotSafeMode();
    const tokenResult = await ensureJobberAccessToken();
    const edges = await fetchRecentJobberRequests(tokenResult.accessToken);
    const payload: { edges: unknown; ingest?: unknown; tokenStatus?: string } = {
      edges,
      tokenStatus: tokenResult.tokenStatus,
    };

    if (supabaseEnabled) {
      try {
        const ingestResult = await ingestJobberRequests(edges);
        payload.ingest = ingestResult;
      } catch (err) {
        console.error("Ingestion error", err);
        payload.ingest = { error: String(err) };
      }
    }

    return NextResponse.json({ data: { requests: { edges } }, ...payload, correlationId });
  } catch (err) {
    console.error("Unexpected error in /api/jobber/requests:", err, { correlationId });
    return jsonError(500, { errorCode: "SERVER_ERROR", message: "Unexpected server error", details: String(err), correlationId });
  }
}
