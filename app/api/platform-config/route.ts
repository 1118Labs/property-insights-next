import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { platformEnum } from "@/lib/platforms/types";
import { listPlatforms } from "@/lib/platforms/resolver";
import { getActivePlatform, setActivePlatform } from "@/lib/platforms/config";
import { assertAdminAuthorized } from "@/lib/utils/auth";

export async function GET() {
  const correlationId = createCorrelationId();
  const active = getActivePlatform();
  return NextResponse.json({ data: { active, options: listPlatforms() }, correlationId });
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
    const parsed = platformEnum.safeParse(body.platform);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid platform", correlationId });
    }
    setActivePlatform(parsed.data);
    return NextResponse.json({ data: { active: parsed.data }, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
