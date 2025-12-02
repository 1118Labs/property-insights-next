import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { buildQuote } from "@/lib/quotes/builder";
import { fetchProfileById } from "@/lib/insights";
import { quoteSchema } from "@/lib/quotes/quote";
import { saveQuote } from "@/lib/quotes/store";
import { buildEnrichedProfile } from "@/lib/insights";

const buildSchema = z.object({
  propertyId: z.string().optional(),
  clientId: z.string().optional(),
  serviceProfile: z.string().optional(),
  persist: z.boolean().optional(),
  address: z.string().optional(),
  urgency: z.boolean().optional(),
  highComplexity: z.boolean().optional(),
});

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = buildSchema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid quote build input", details: parsed.error.format(), correlationId });
    }
    const serviceProfile = (parsed.data.serviceProfile as any) || "cleaning";

    let profile = parsed.data.propertyId ? await fetchProfileById(parsed.data.propertyId) : null;
    if (!profile && parsed.data.address) {
      profile = await buildEnrichedProfile(parsed.data.address, false, serviceProfile);
    }
    if (!profile) {
      return jsonError(404, { errorCode: "NOT_FOUND", message: "Property not found for quote", correlationId });
    }

    const quote = buildQuote(profile, serviceProfile, {
      urgencyMultiplier: parsed.data.urgency ? 1.15 : 1,
      complexityMultiplier: parsed.data.highComplexity ? 1.1 : undefined,
    });
    if (parsed.data.persist) saveQuote(quote);
    return NextResponse.json({ data: quote, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
