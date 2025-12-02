import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { buildEnrichedProfile } from "@/lib/insights";
import { buildQuote } from "@/lib/quotes/builder";

export async function GET(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const url = new URL(req.url);
    const address = url.searchParams.get("address");
    const serviceProfile = (url.searchParams.get("serviceProfile") as any) || "cleaning";
    const urgency = url.searchParams.get("urgency") === "true";
    if (!address) return jsonError(400, { errorCode: "INVALID_INPUT", message: "address required", correlationId });
    const profile = await buildEnrichedProfile(address, false, serviceProfile);
    const quote = buildQuote(profile, serviceProfile, { urgencyMultiplier: urgency ? 1.15 : 1 });
    return NextResponse.json({ data: quote, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
