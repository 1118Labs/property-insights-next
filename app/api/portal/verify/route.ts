import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { verifyInvite } from "@/lib/portal/store";
import { portalDisabled } from "@/lib/portal/config";
import { recordPortalActivity } from "@/lib/portal/activityStore";

export async function GET(req: Request) {
  const correlationId = createCorrelationId();
  if (portalDisabled) {
    return jsonError(403, { errorCode: "PORTAL_DISABLED", message: "Client portal is disabled", correlationId });
  }
  const url = new URL(req.url);
  const token = url.searchParams.get("token") || req.headers.get("x-portal-token") || "";
  if (!token) return jsonError(400, { errorCode: "INVALID_INPUT", message: "Token required", correlationId });
  const session = verifyInvite(token);
  if (!session) return jsonError(404, { errorCode: "NOT_FOUND", message: "Invalid or expired token", correlationId });
  recordPortalActivity(token, "verify");
  return NextResponse.json({ data: session, correlationId });
}
