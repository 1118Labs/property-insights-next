import { NextResponse } from "next/server";
import { ingestFromPlatform } from "@/lib/ingestion/platformIngestion";
import { platformEnum } from "@/lib/platforms/types";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";
import { assertNotSafeMode } from "@/lib/config";
import { assertAdminAuthorized } from "@/lib/utils/auth";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    return jsonError((err as { status?: number })?.status ?? 401, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  if (!rateLimitGuard("api:platform-ingest", 10, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many ingestion attempts", correlationId });
  }
  const body = await req.json().catch(() => ({}));
  const dryRun = Boolean(body.dryRun);
  const limit = typeof body.limit === "number" ? body.limit : undefined;
  const platform = platformEnum.safeParse(body.platform).success ? body.platform : undefined;
  try {
    if (!dryRun) assertNotSafeMode();
    const result = await ingestFromPlatform({ platform, limit, dryRun });
    return NextResponse.json({ data: result, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
