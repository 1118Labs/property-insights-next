import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { getSchedulingConfig, updateSchedulingConfig } from "@/lib/scheduling/config";
import { assertAdminAuthorized } from "@/lib/utils/auth";

export async function GET() {
  const correlationId = createCorrelationId();
  return NextResponse.json({ data: getSchedulingConfig(), correlationId });
}

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    return jsonError((err as { status?: number })?.status ?? 401, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const updated = updateSchedulingConfig(body);
    return NextResponse.json({ data: updated, correlationId });
  } catch (err) {
    return jsonError(400, { errorCode: "INVALID_INPUT", message: String(err), correlationId });
  }
}
