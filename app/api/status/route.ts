import { NextResponse } from "next/server";
import { isSupabaseConfigured, isJobberConfigured } from "@/lib/config";
import { getLatestJobberTokens, isTokenStale } from "@/lib/jobber";
import { supabaseEnabled } from "@/lib/supabase/server";
import { isExternalConfigured } from "@/lib/providers";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { getCounters } from "@/lib/utils/telemetry";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export async function GET() {
  const correlationId = createCorrelationId();
  try {
    const latestTokens =
      isJobberConfigured && supabaseEnabled
        ? await getLatestJobberTokens().catch(() => null)
        : null;
    return NextResponse.json({
      supabase: { configured: isSupabaseConfigured, enabled: supabaseEnabled },
      jobber: {
        configured: isJobberConfigured,
        hasToken: !!latestTokens?.access_token,
        tokenAge: latestTokens?.created_at,
        accountId: latestTokens?.jobber_account_id,
        tokenStatus: latestTokens ? (isTokenStale(latestTokens) ? "stale" : "fresh") : "missing",
      },
      external: isExternalConfigured(),
      telemetry: getCounters(),
      schemaDrift: detectSchemaDrift(),
      correlationId,
    }, { headers: { "x-correlation-id": correlationId } });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}

function detectSchemaDrift() {
  try {
    const schemaPath = path.join(process.cwd(), "supabase", "schema.sql");
    const content = fs.readFileSync(schemaPath, "utf8");
    return { present: true, checksum: hashString(content) };
  } catch {
    return { present: false };
  }
}

function hashString(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}
