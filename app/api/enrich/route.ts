import { NextResponse } from "next/server";
import { enrichProperty } from "@/lib/enrichment";
import { enrichRequestSchema } from "@/lib/utils/validationSchema";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";
import { logStructured } from "@/lib/utils/logging";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  if (!rateLimitGuard("api:enrich", 40, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many requests", correlationId });
  }
  try {
    const json = await req.json();
    const parsed = enrichRequestSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid input", details: parsed.error.format(), correlationId });
    }

    const result = await enrichProperty(parsed.data.address.trim(), {
      providers: parsed.data.providers,
      skipCache: parsed.data.forceRefresh,
    }).catch((err) => {
      return { property: { address: { line1: parsed.data.address } }, sources: [], errors: [String(err)], meta: { fallbackUsed: true } } as unknown as Awaited<ReturnType<typeof enrichProperty>>;
    });
    logStructured("info", "enrich_request", { correlationId, address: parsed.data.address });
    return NextResponse.json({
      data: {
        property: result.property,
        sources: result.sources,
        warnings: result.errors,
        meta: result.meta,
        providerErrors: result.meta?.providerErrors,
        aerial: result.aerial,
      },
      correlationId,
    });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: err instanceof Error ? err.message : String(err), correlationId });
  }
}
