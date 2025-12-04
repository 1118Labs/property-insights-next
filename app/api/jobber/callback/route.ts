import { NextResponse } from "next/server";
import { exchangeCodeForTokens } from "@/lib/jobber";
import { resolveBaseUrl } from "@/lib/jobber";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const origin = url.origin;

  if (!code) {
    return NextResponse.json(
      { error: "missing_code", message: "No OAuth code was provided." },
      { status: 400 }
    );
  }

  try {
    // ============================================
    // RAW DEBUG LOGGING BEFORE TOKEN EXCHANGE
    // ============================================
    console.log("=== JOBBER CALLBACK DEBUG START ===");
    console.log("Request Origin:", origin);
    console.log("JOBBER_CLIENT_ID:", process.env.JOBBER_CLIENT_ID);
    console.log("JOBBER_REDIRECT_URI:", process.env.JOBBER_REDIRECT_URI);
    console.log("JOBBER_TOKEN_URL:", process.env.JOBBER_TOKEN_URL);
    console.log("=== JOBBER CALLBACK DEBUG END ===");

    // ============================================
    // Attempt exchange
    // ============================================
    const tokens = await exchangeCodeForTokens(code, origin);

    return NextResponse.json(
      { success: true, tokens },
      { status: 200 }
    );

  } catch (err: any) {
    console.error("CALLBACK ERROR:", err.message);

    return NextResponse.json(
      {
        error: "callback_failed",
        message: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
