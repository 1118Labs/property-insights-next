import { NextResponse } from "next/server";
import { exchangeCodeForTokens, resolveBaseUrl, storeJobberTokens } from "@/lib/jobber";
import { supabaseEnabled } from "@/lib/supabase/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const correlationId = createCorrelationId();
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return jsonError(400, { errorCode: "JOBBER_OAUTH_ERROR", message: "Jobber OAuth error", details: error, correlationId });
  }

  if (!code) {
    return jsonError(400, { errorCode: "MISSING_AUTH_CODE", message: "Missing authorization code", correlationId });
  }

  if (!supabaseEnabled) {
    return jsonError(500, { errorCode: "SUPABASE_DISABLED", message: "Supabase env vars missing; cannot store Jobber tokens", correlationId });
  }

  try {
    const origin = url.origin;
    const tokenResponse = await exchangeCodeForTokens(code, origin);
    await storeJobberTokens(tokenResponse);

    const base = resolveBaseUrl(origin) || origin;
    return NextResponse.redirect(new URL("/connected", base));
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    console.error("Jobber OAuth callback error", err, { correlationId });
    return jsonError(500, { errorCode: "JOBBER_CALLBACK_FAILURE", message: "Failed to complete Jobber OAuth", details: detail, correlationId });
  }
}
