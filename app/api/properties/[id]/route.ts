import { NextRequest, NextResponse } from "next/server";
import { fetchProfileById } from "@/lib/insights";
import { createCorrelationId, jsonError } from "@/lib/utils/api";

export async function GET(_: NextRequest, context: { params: Promise<{ id: string }> }) {
  const correlationId = createCorrelationId();
  try {
    const params = await context.params;
    const profile = await fetchProfileById(params.id);
    if (!profile) {
      return jsonError(404, { errorCode: "NOT_FOUND", message: "Property not found", correlationId });
    }
    return NextResponse.json({ data: profile, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: "Failed to load property", details: String(err), correlationId });
  }
}
