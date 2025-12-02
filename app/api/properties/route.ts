import { NextResponse } from "next/server";
import { fetchStoredProfiles, summarizeProfiles } from "@/lib/insights";
import { PropertyProfile } from "@/lib/types";
import { createCorrelationId, jsonError } from "@/lib/utils/api";

export async function GET() {
  const correlationId = createCorrelationId();
  try {
    const profiles = await fetchStoredProfiles();
    const summary = summarizeProfiles(profiles);
    return NextResponse.json({
      data: {
        items: profiles.map((p: PropertyProfile & { enrichment_sources?: unknown; enrichment_errors?: unknown; enrichment_meta?: unknown }) => {
          const enrichment =
            p.enrichment || {
              sources: p.enrichment_sources as string[] | undefined,
              errors: p.enrichment_errors as string[] | undefined,
              meta: p.enrichment_meta as Record<string, unknown> | undefined,
            };
          return {
            ...p,
            enrichment,
            insights: { ...p.insights, provenance: enrichment },
          };
        }),
        summary,
      },
      correlationId,
    });
  } catch (err) {
    console.error("properties GET error", err, { correlationId });
    return jsonError(500, { errorCode: "SERVER_ERROR", message: "Failed to load properties", details: String(err), correlationId });
  }
}
