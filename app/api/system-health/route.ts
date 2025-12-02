import { NextResponse } from "next/server";
import { getProviderLatencySnapshot, getProviderHealth } from "@/lib/utils/telemetry";
import { createCorrelationId } from "@/lib/utils/api";

export async function GET() {
  const correlationId = createCorrelationId();
  try {
    const providerHealth = getProviderHealth();
    const latency = getProviderLatencySnapshot();
    return NextResponse.json({ providerHealth, latency, correlationId }, { headers: { "x-correlation-id": correlationId } });
  } catch (err) {
    return NextResponse.json({ error: String(err), correlationId }, { status: 500 });
  }
}
