import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { approveInvite } from "@/lib/portal/store";
import { recordPortalActivity } from "@/lib/portal/activityStore";
import { triggerEvent } from "@/lib/notifications/engine";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || req.headers.get("x-portal-token") || "";
    if (!token) return jsonError(400, { errorCode: "INVALID_INPUT", message: "Token required", correlationId });
    const result = approveInvite(token);
    if (!result) return jsonError(404, { errorCode: "NOT_FOUND", message: "Invalid or expired token", correlationId });
    recordPortalActivity(token, "approve");
    triggerEvent("quote_approved", { token, propertyId: result.propertyId, quoteId: result.quoteId });
    return NextResponse.json({ data: result, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
