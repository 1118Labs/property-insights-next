import { ensureJobberAccessToken, fetchRecentJobberRequests, ingestJobberRequests } from "@/lib/jobber";
import { supabaseEnabled } from "@/lib/supabase/server";
import { logIngestionEvent } from "@/lib/utils/ingestion";
import { incrCounter, logEvent } from "@/lib/utils/telemetry";

export async function jobberIngestionTask({ limit = 25, dryRun = false }: { limit?: number; dryRun?: boolean } = {}) {
  if (!supabaseEnabled) {
    return { status: "skipped", reason: "supabase_disabled" } as const;
  }

  try {
    const token = await ensureJobberAccessToken();
    const edges = await fetchRecentJobberRequests(token.accessToken, limit);
    const ingestResult = dryRun ? { ingested: 0, skipped: 0, errors: [] as string[] } : await ingestJobberRequests(edges);

    await logIngestionEvent({
      source: "jobber",
      status: ingestResult.errors?.length ? "partial" : "success",
      detail: { dryRun, limit, ...ingestResult, tokenStatus: token.tokenStatus },
    });

    incrCounter("jobber.ingest");
    if (ingestResult.errors?.length) incrCounter("jobber.ingest.errors");
    logEvent("jobber.ingest", { mode: dryRun ? "dry-run" : "persist", tokenStatus: token.tokenStatus, ingested: ingestResult.ingested });

    return {
      status: "ok" as const,
      tokenStatus: token.tokenStatus,
      totalFetched: edges.length,
      ingestResult,
    };
  } catch (err) {
    await logIngestionEvent({ source: "jobber", status: "failed", detail: { error: String(err) } }).catch(() => {});
    return { status: "failed" as const, error: String(err) };
  }
}
