import { NextResponse } from "next/server";
import { jobberIngestionTask } from "@/lib/utils/background";
import { assertAdminAuthorized } from "@/lib/utils/auth";
import { assertNotSafeMode } from "@/lib/config";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  if (!rateLimitGuard("api:cron-run", 10, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many cron triggers", correlationId });
  }
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    const status = (err as { status?: number } | undefined)?.status ?? 401;
    return jsonError(status, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }

  try {
    assertNotSafeMode();
    const body = await req.json().catch(() => ({}));
    const { task = "jobber-ingest", dryRun = true, addresses = [] } = body || {};
    if (task !== "jobber-ingest") {
      if (task === "property-insights-batch") {
        const samples: string[] = addresses.length ? addresses : ["123 Demo Ln", "456 Sample St"];
        return NextResponse.json({ data: samples.map((addr) => ({ address: addr, mode: dryRun ? "dry-run" : "pending" })), correlationId });
      }
      return jsonError(400, { errorCode: "UNKNOWN_TASK", message: "Unknown task", correlationId });
    }
    const result = await jobberIngestionTask({ dryRun });
    return NextResponse.json({ data: result, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
