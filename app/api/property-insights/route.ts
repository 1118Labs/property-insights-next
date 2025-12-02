import { NextResponse } from "next/server";
import { buildEnrichedProfile, createInsightFromAddress } from "@/lib/insights";
import { addressInputSchema } from "@/lib/utils/validationSchema";
import { createCorrelationId, jsonError, rateLimitGuard } from "@/lib/utils/api";
import { logStructured } from "@/lib/utils/logging";
import { resolveActiveProfiles, generateServiceInsight } from "@/lib/service_profiles";
import { getActivePlatform } from "@/lib/platforms/config";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  if (!rateLimitGuard("api:property-insights", 30, 60_000)) {
    return jsonError(429, { errorCode: "RATE_LIMIT", message: "Too many requests", correlationId });
  }
  try {
    const json = await req.json();
    const parsed = addressInputSchema.safeParse(json);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid input", details: parsed.error.format(), correlationId });
    }

    const { address, persist = true, enrich = true, serviceProfile } = parsed.data;

    // Attempt enrichment, fall back to heuristic creation
    const profile = enrich ? await buildEnrichedProfile(address, persist, serviceProfile) : await createInsightFromAddress(address, persist);

    if (!enrich && persist) {
      await createInsightFromAddress(address, true);
    }

    const profiles = resolveActiveProfiles(serviceProfile);
    const serviceSpecific = profiles.map((p) => generateServiceInsight(p, profile.property, profile.insights, profile.insights.provenance?.errors || [], profile.insights.aerialInsights));

    const diagnostics = enrich
      ? profile.enrichment && { sources: profile.enrichment.sources, warnings: profile.enrichment.errors, meta: profile.enrichment.meta }
      : undefined;

    const platform = getActivePlatform();
    logStructured("info", "property_insight", { correlationId, address, enrich, sources: diagnostics?.sources, serviceProfile, platform });
    return NextResponse.json({ data: { ...profile, serviceSpecific, serviceProfile }, diagnostics, correlationId });
  } catch (err) {
    console.error("property-insights error", err, { correlationId });
    return jsonError(500, { errorCode: "SERVER_ERROR", message: "Failed to build property insight", details: String(err), correlationId });
  }
}
