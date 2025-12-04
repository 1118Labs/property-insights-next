// app/api/jobber/callback/route.ts

import { NextRequest, NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  storeJobberTokens,
  missingJobberEnvResponse,
} from "@/lib/jobber";

function hasJobberEnv() {
  return Boolean(
    process.env.JOBBER_CLIENT_ID &&
      process.env.JOBBER_CLIENT_SECRET &&
      process.env.JOBBER_REDIRECT_URI
  );
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");

  // Basic sanity check for envs
  if (!hasJobberEnv()) {
    console.error("[jobber/callback] Missing Jobber env vars", {
      hasClientId: !!process.env.JOBBER_CLIENT_ID,
      hasClientSecret: !!process.env.JOBBER_CLIENT_SECRET,
      hasRedirectUri: !!process.env.JOBBER_REDIRECT_URI,
    });

    return NextResponse.json(
      {
        error: "missing_env",
        ...missingJobberEnvResponse(),
      },
      { status: 500 }
    );
  }

  if (!code) {
    console.error("[jobber/callback] Missing ?code param from Jobber");
    return NextResponse.json(
      {
        error: "missing_code",
        message: "Jobber did not return an authorization code.",
      },
      { status: 400 }
    );
  }

  try {
    console.log("[jobber/callback] Exchanging code for Jobber tokens…");

    // 1) Exchange the OAuth code for tokens (already working)
    const tokenRow = await exchangeCodeForTokens(code, url.origin);

    console.log("[jobber/callback] Token exchange succeeded, storing in Supabase…");

    // 2) Persist tokens in Supabase (jobber_tokens table)
    const stored = await storeJobberTokens(tokenRow);

    console.log("[jobber/callback] Tokens stored in Supabase", {
      jobber_account_id: stored.jobber_account_id,
    });

    // 3) Return a clean JSON payload (same shape as before, but now persisted)
    return NextResponse.json({
      success: true,
      tokens: {
        jobber_account_id: stored.jobber_account_id,
        access_token: stored.access_token,
        refresh_token: stored.refresh_token,
        expires_at: stored.expires_at,
      },
    });
  } catch (err: any) {
    console.error("[jobber/callback] Error during callback", {
      message: err?.message,
      stack: err?.stack,
    });

    return NextResponse.json(
      {
        error: "callback_failed",
        message: err?.message || "Unknown error during Jobber OAuth callback.",
      },
      { status: 500 }
    );
  }
}
