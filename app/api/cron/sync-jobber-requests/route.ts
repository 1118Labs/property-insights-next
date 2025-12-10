import { NextResponse } from "next/server";
import {
  enrichWithRentcast,
  EnrichmentStats,
  fetchJobberRequestsNormalized,
} from "@/app/api/jobber/requests/route";
import { getAnyJobberAccessToken } from "@/lib/jobberTokens";
import { getAccountByJobberAccountId, incrementUsage } from "@/lib/accounts";
import { logError, logInfo } from "@/lib/logging";

export async function GET() {
  try {
    const token = await getAnyJobberAccessToken();
    if (!token) {
      return NextResponse.json(
        { synced: 0, enriched: 0, reused_cache: 0, message: "No Jobber token." },
        { status: 200 }
      );
    }

    logInfo("cron.sync", "Starting Jobber sync", {
      jobberAccountId: token.jobberAccountId,
    });

    const account = await getAccountByJobberAccountId(token.jobberAccountId);

    const baseItems = await fetchJobberRequestsNormalized(
      token.accessToken,
      token.jobberAccountId
    );

    const stats: EnrichmentStats = {
      cached: 0,
      stored: 0,
      lookedUp: 0,
      fallback: 0,
    };

    const enriched = await enrichWithRentcast(baseItems, {
      stats,
      accountId: account?.id,
    });

    if (account?.id) {
      incrementUsage(account.id, "requests_synced", enriched.length).catch(() => {});
    }

    logInfo("cron.sync", "Jobber sync completed", {
      synced: enriched.length,
      enriched: stats.stored,
      cached: stats.cached,
    });

    return NextResponse.json({
      synced: enriched.length,
      enriched: stats.stored,
      reused_cache: stats.cached,
      looked_up: stats.lookedUp,
      fallback: stats.fallback,
    });
  } catch (err: unknown) {
    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
        ? err
        : "Unknown error";
    logError("cron.sync", "Sync failed", { err: message });
    return NextResponse.json(
      { error: "sync_failed", message },
      { status: 500 }
    );
  }
}
