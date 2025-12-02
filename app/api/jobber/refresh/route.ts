import { NextResponse } from "next/server";
import { getLatestJobberTokens, refreshJobberToken, storeJobberTokens } from "@/lib/jobber";
import { supabaseEnabled } from "@/lib/supabase/server";
import { assertNotSafeMode } from "@/lib/config";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";
import { assertAdminAuthorized } from "@/lib/utils/auth";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  if (!rateLimitGuard("api:jobber-refresh", 10, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many refresh attempts", correlationId });
  }
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    const status = (err as { status?: number } | undefined)?.status ?? 401;
    return jsonError(status, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }

  try {
    assertNotSafeMode();
    if (!supabaseEnabled) {
      return jsonError(400, { errorCode: "SUPABASE_DISABLED", message: "Supabase not configured; cannot refresh tokens without storage.", correlationId });
    }

    const latest = await getLatestJobberTokens();
    if (!latest?.refresh_token) {
      return jsonError(400, { errorCode: "MISSING_REFRESH", message: "No refresh token available. Connect Jobber first.", correlationId });
    }

    const refreshed = await refreshJobberToken(latest.refresh_token);
    if (supabaseEnabled) {
      await storeJobberTokens({ ...refreshed, jobber_account_id: latest.jobber_account_id, expires_at: refreshed.expires_at });
    }

    return NextResponse.json({ data: refreshed, correlationId }, { headers: { "x-correlation-id": correlationId } });
  } catch (err) {
    console.error("Jobber refresh error", err, { correlationId });
    return jsonError(500, { errorCode: "SERVER_ERROR", message: "Refresh failed", details: String(err), correlationId });
  }
}
