import { NextResponse } from "next/server";
import { buildJobberAuthUrl } from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";

export const runtime = "nodejs";

// Shared handler so both /auth and /authorize call same logic
export async function handleJobberAuth(request: Request) {
  const origin = request.headers.get("origin") || undefined;
  const correlationId = createCorrelationId();

  try {
    const redirect = buildJobberAuthUrl(origin);
    return NextResponse.redirect(redirect);
  } catch (err: any) {
    console.error("Jobber auth error:", err);

    return new NextResponse(
      JSON.stringify({
        error: "jobber_auth_failed",
        message: err?.message,
        correlationId,
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  return handleJobberAuth(request);
}
