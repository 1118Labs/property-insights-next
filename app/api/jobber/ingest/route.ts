import { NextResponse } from "next/server";
import { fetchRecentJobberRequests, ingestJobberRequests, ensureJobberAccessToken } from "@/lib/jobber";
import { supabaseEnabled } from "@/lib/supabase/server";
import { ingestRequestSchema } from "@/lib/utils/validationSchema";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";
import { assertNotSafeMode } from "@/lib/config";
import { assertAdminAuthorized } from "@/lib/utils/auth";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    const status = (err as { status?: number } | undefined)?.status ?? 401;
    return jsonError(status, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  if (!rateLimitGuard("api:jobber-ingest", 10, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many ingestion attempts", correlationId });
  }

  if (!supabaseEnabled) {
    return jsonError(400, { errorCode: "SUPABASE_DISABLED", message: "Supabase not configured; cannot persist ingestion.", correlationId });
  }

  try {
    assertNotSafeMode();
    const body = await req.json().catch(() => ({}));
    const parsedDry = ingestRequestSchema.safeParse(body);
    if (!parsedDry.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid ingest options", details: parsedDry.error.format(), correlationId });
    }
    const dryRun = Boolean(parsedDry.data.dryRun);
    const limit = parsedDry.data.limit ?? 25;

    const tokenResult = await ensureJobberAccessToken();
    const edges = await fetchRecentJobberRequests(tokenResult.accessToken, limit);

    const result = dryRun
      ? { ingested: 0, skipped: 0, errors: [] as string[], summaries: edges.map((e) => ({ id: e.node.id, client: e.node.client?.firstName, property: e.node.property?.address?.line1 })) }
      : await ingestJobberRequests(edges);
    return NextResponse.json({
      result,
      totalFetched: edges.length,
      mode: dryRun ? "dry-run" : "ingest",
      tokenStatus: tokenResult.tokenStatus,
      platform: "jobber",
      correlationId,
    });
  } catch (err) {
    console.error("Jobber ingest error", err, { correlationId });
    const status = (err as { status?: number } | undefined)?.status === 401 ? 401 : 500;
    return jsonError(status, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
