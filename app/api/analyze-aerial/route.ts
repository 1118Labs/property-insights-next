import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { runAerialInsights } from "@/lib/aerial";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    const address = body.address as string | undefined;
    if (!address) return jsonError(400, { errorCode: "INVALID_INPUT", message: "address required", correlationId });
    const aerial = await runAerialInsights(address);
    return NextResponse.json({ data: aerial, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
