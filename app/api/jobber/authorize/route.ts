import { NextResponse } from "next/server";
import { buildJobberAuthUrl } from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const origin = request.headers.get("origin") || new URL(request.url).origin;
  const correlationId = createCorrelationId();

  try {
    const redirect = buildJobberAuthUrl(origin);
    return NextResponse.redirect(redirect);
  } catch (err: any) {
    console.error("Jobber authorize error:", err);

    return new NextResponse(
      JSON.stringify({
        error: "jobber_authorize_failed",
        message: err?.message,
        correlationId,
      }),
      { status: 500 }
    );
  }
}
