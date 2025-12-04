import { NextResponse } from "next/server";
import { exchangeCodeForTokens, storeJobberTokens } from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const correlationId = createCorrelationId();

  try {
    const url = new URL(request.url);
    const code = url.searchParams.get("code");
    const origin = request.headers.get("origin") || url.origin;

    // 🔥🔥🔥 TEMPORARY ENV CHECK — PRINTS TO NETLIFY FUNCTION LOGS 🔥🔥🔥
    console.log("🔥 ENV CHECK (callback):", {
      has_client_id: !!process.env.JOBBER_CLIENT_ID,
      has_client_secret: !!process.env.JOBBER_CLIENT_SECRET,
      has_redirect_uri: !!process.env.JOBBER_REDIRECT_URI,
      client_id_length: process.env.JOBBER_CLIENT_ID?.length || 0,
      redirect_uri_value: process.env.JOBBER_REDIRECT_URI,
      node_env: process.env.NODE_ENV,
    });
    // END TEMP BLOCK ------------------------------------------------------

    if (!code) {
      return NextResponse.json(
        {
          error: "missing_code",
          message: "Jobber returned no authorization code",
          correlationId,
        },
        { status: 400 }
      );
    }

    // Exchange the code for tokens
    const tokenResponse = await exchangeCodeForTokens(code, origin);

    // Store tokens in Supabase
    const stored = await storeJobberTokens(tokenResponse);

    return NextResponse.json(
      {
        ok: true,
        correlationId,
        stored,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("🔥 Callback error:", {
      message: err?.message,
      stack: err?.stack,
      correlationId,
    });

    return NextResponse.json(
      {
        error: "callback_failed",
        message: err?.message,
        correlationId,
      },
      { status: 500 }
    );
  }
}
