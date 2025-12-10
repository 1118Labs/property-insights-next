import { NextResponse } from "next/server";
import { getJobberToken } from "@/lib/jobberTokens";

export async function GET() {
  try {
    const { token, reason } = await getJobberToken({ requireValid: false });

    if (!token) {
      if (reason === "missing_token") {
        return NextResponse.json({ connected: false, reason: "no_token" });
      }
      return NextResponse.json({ connected: false, error: "token_resolution_failed" });
    }

    const expiresAt =
      typeof token.expires_at === "number" ? token.expires_at : token.expires_at ?? null;
    const now = Math.floor(Date.now() / 1000);

    if (expiresAt !== null && expiresAt < now) {
      return NextResponse.json({ connected: true, needs_refresh: true });
    }

    return NextResponse.json({ connected: true });
  } catch {
    return NextResponse.json(
      { connected: false, error: "token_resolution_failed" },
      { status: 200 }
    );
  }
}
