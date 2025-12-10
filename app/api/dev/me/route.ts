import { NextResponse } from "next/server";
import { getCurrentUserFromRequest } from "@/lib/currentUser";
import { isAuthEnabled } from "@/lib/featureFlags";

export async function GET(req: Request) {
  const user = await getCurrentUserFromRequest(req);
  if (!isAuthEnabled()) {
    return NextResponse.json({
      authenticated: true,
      user: { email: "dev@local", role: "owner" },
    });
  }
  return NextResponse.json({
    authenticated: Boolean(user),
    user: user ?? null,
  });
}
