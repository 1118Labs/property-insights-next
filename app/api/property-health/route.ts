import { NextResponse } from "next/server";
import { addressInputSchema } from "@/lib/utils/validationSchema";
import { enrichProperty } from "@/lib/enrichment";
import { scoreProperty } from "@/lib/scoring";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  if (!rateLimitGuard("api:property-health", 30, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many requests", correlationId });
  }
  try {
    const json = await req.json();
    const parsed = addressInputSchema.pick({ address: true }).safeParse(json);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid input", details: parsed.error.format(), correlationId });
    }

    const enrich = await enrichProperty(parsed.data.address.trim());
    const { insight } = scoreProperty(enrich.property);

    return NextResponse.json({
      data: {
        property: enrich.property,
        insight,
        sources: enrich.sources,
        warnings: enrich.errors,
        meta: enrich.meta,
      },
      correlationId,
    });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: "Failed to compute property health", details: String(err), correlationId });
  }
}
