import { NextResponse } from "next/server";
import { fetchJobberClient, ensureJobberAccessToken } from "@/lib/jobber";
import { supabaseEnabled } from "@/lib/supabase/server";
import { isNonEmptyString } from "@/lib/utils/validation";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";
import { assertAdminAuthorized } from "@/lib/utils/auth";
import { assertNotSafeMode } from "@/lib/config";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  if (!rateLimitGuard("api:jobber-client", 20, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many requests", correlationId });
  }
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    const status = (err as { status?: number } | undefined)?.status ?? 401;
    return jsonError(status, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  try {
    const { clientId } = await req.json();

    if (!isNonEmptyString(clientId)) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Missing or invalid clientId", correlationId });
    }

    if (!supabaseEnabled) {
      return jsonError(400, { errorCode: "SUPABASE_DISABLED", message: "Supabase not configured; Jobber tokens unavailable.", correlationId });
    }

    assertNotSafeMode();
    const tokenResult = await ensureJobberAccessToken();
    const data = await fetchJobberClient(tokenResult.accessToken, clientId.trim());
    return NextResponse.json({ ...data, tokenStatus: tokenResult.tokenStatus, correlationId }, { headers: { "x-correlation-id": correlationId } });
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return jsonError(500, { errorCode: "SERVER_ERROR", message: "Exception during Jobber client fetch", details: detail, correlationId });
  }
}
