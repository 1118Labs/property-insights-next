import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { getNotificationConfig, updateNotificationConfig } from "@/lib/notifications/engine";
import { assertAdminAuthorized } from "@/lib/utils/auth";

const schema = z.object({
  webhookUrls: z.array(z.string()).optional(),
  fromEmail: z.string().email().optional(),
  smsFrom: z.string().optional(),
});

export async function GET() {
  const correlationId = createCorrelationId();
  return NextResponse.json({ data: getNotificationConfig(), correlationId });
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
    const parsed = schema.safeParse(body);
    if (!parsed.success) return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid config", details: parsed.error.format(), correlationId });
    const updated = updateNotificationConfig(parsed.data);
    return NextResponse.json({ data: updated, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
