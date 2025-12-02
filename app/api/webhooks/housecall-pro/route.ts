import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { logStructured } from "@/lib/utils/logging";
import { logIngestionEvent } from "@/lib/utils/ingestion";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    logStructured("info", "webhook_housecall_pro", { correlationId, platform: "housecall_pro", body });
    await logIngestionEvent({ source: "webhook", status: "received", platform: "housecall_pro", detail: { body } });
    return NextResponse.json({ ok: true, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
