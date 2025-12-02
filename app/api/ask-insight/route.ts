import { NextResponse } from "next/server";
import { fetchProfileById } from "@/lib/insights";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { generateNarrative, computeTrends } from "@/lib/insights_extra";

export async function GET(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const url = new URL(req.url);
    const q = url.searchParams.get("q");
    const id = url.searchParams.get("id");
    if (!q && !id) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Provide q or id", correlationId });
    }
    if (id) {
      const profile = await fetchProfileById(id);
      if (!profile) return jsonError(404, { errorCode: "NOT_FOUND", message: "Profile not found", correlationId });
      const narrative = generateNarrative(profile.property, profile.insights);
      const trends = computeTrends(profile.insights);
      return NextResponse.json({ data: { narrative, trends, riskFlags: profile.insights.riskFlags }, correlationId });
    }
    return NextResponse.json({ data: { answer: `Stub insight for: ${q}` }, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
