import { NextResponse } from "next/server";
import { getProviderHealth } from "@/lib/utils/telemetry";
import { createCorrelationId } from "@/lib/utils/api";

export async function GET() {
  try {
    const correlationId = createCorrelationId();
    const health = getProviderHealth();
    return NextResponse.json({ data: health, correlationId }, { headers: { "x-correlation-id": correlationId } });
  } catch (err) {
    const correlationId = createCorrelationId();
    return NextResponse.json({ errorCode: "SERVER_ERROR", message: String(err), correlationId }, { status: 500, headers: { "x-correlation-id": correlationId } });
  }
}
