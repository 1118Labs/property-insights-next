import { NextResponse } from "next/server";
import {
  exchangeCodeForTokens,
  storeJobberTokens,
} from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const origin = request.headers.get("origin") || url.origin;
  const correlationId = createCorrelationId();

  if (!code) {
    return NextResponse.json(
      {
        error: "missing_code",
        message: "Jobber returned without an authorization code.",
        correlationId,
      },
      { status: 400 }
    );
  }

  try {
    // Exchange code for tokens (safe, HTML-resistant)
    const tokens = await exchangeCodeForTokens(code, origin);

    // Persist to Supabase
    await storeJobberTokens(tokens);

    return NextResponse.redirect("/portal?connected=jobber");
  } catch (err: any) {
    console.error("Jobber callback error:", err);

    return NextResponse.json(
      {
        error: "jobber_callback_failed",
        message: err?.message,
        correlationId,
      },
      { status: 500 }
    );
  }
}
