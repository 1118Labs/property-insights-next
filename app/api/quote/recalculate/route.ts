import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { getQuote, saveQuote } from "@/lib/quotes/store";
import { fetchProfileById } from "@/lib/insights";
import { buildQuote } from "@/lib/quotes/builder";

const schema = z.object({
  quoteId: z.string(),
});

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "quoteId required", details: parsed.error.format(), correlationId });
    }
    const existing = getQuote(parsed.data.quoteId);
    if (!existing) return jsonError(404, { errorCode: "NOT_FOUND", message: "Quote not found", correlationId });
    const profile = existing.propertyId ? await fetchProfileById(existing.propertyId) : null;
    if (!profile) return jsonError(404, { errorCode: "NOT_FOUND", message: "Property not found for quote", correlationId });
    const rebuilt = buildQuote(profile, existing.serviceProfile);
    const saved = saveQuote({ ...rebuilt, id: existing.id });
    return NextResponse.json({ data: saved, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
