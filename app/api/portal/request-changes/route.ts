import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { requestChanges } from "@/lib/portal/store";
import { recordPortalActivity } from "@/lib/portal/activityStore";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    const token = body.token || req.headers.get("x-portal-token") || "";
    if (!token) return jsonError(400, { errorCode: "INVALID_INPUT", message: "Token required", correlationId });
    const result = requestChanges(token);
    if (!result) return jsonError(404, { errorCode: "NOT_FOUND", message: "Invalid or expired token", correlationId });
    recordPortalActivity(token, "request_changes");
    return NextResponse.json({ data: result, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
