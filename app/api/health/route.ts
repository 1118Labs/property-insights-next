import { NextResponse } from "next/server";
import { supabaseEnabled, requireAdminClient } from "@/lib/supabase/server";
import { getLatestJobberTokens, isTokenStale } from "@/lib/jobber";
import { isExternalConfigured } from "@/lib/providers";
import { getCounters, getProviderHealth } from "@/lib/utils/telemetry";
import { adapters } from "@/lib/enrichment/adapters";
import { describeCircuit } from "@/lib/utils/retry";
import { createCorrelationId } from "@/lib/utils/api";
import { logStructured } from "@/lib/utils/logging";

async function checkSupabase() {
  if (!supabaseEnabled) return { status: "disabled", statusCode: 0 } as const;
  try {
    const admin = requireAdminClient();
    await admin.from("properties").select("id").limit(1);
    return { status: "ok", statusCode: 200 } as const;
  } catch (err) {
    return { status: "error", error: String(err), statusCode: 500 } as const;
  }
}

async function checkJobber() {
  try {
    const token = await getLatestJobberTokens();
    if (!token?.access_token) return { status: "missing", statusCode: 404 };
    const expiresAtMs = token.expires_at ? token.expires_at * 1000 : null;
    const daysRemaining = expiresAtMs ? Math.max(0, Math.round((expiresAtMs - Date.now()) / (1000 * 60 * 60 * 24))) : null;
    return {
      status: isTokenStale(token) ? "stale" : "ok",
      statusCode: isTokenStale(token) ? 299 : 200,
      accountId: token.jobber_account_id,
      expiresAt: token.expires_at,
      daysRemaining,
    };
  } catch (err) {
    return { status: "error", error: String(err), statusCode: 500 };
  }
}

export async function GET() {
  const correlationId = createCorrelationId();
  const supabase = await checkSupabase();
  const jobber = await checkJobber();
  const external = isExternalConfigured();
  const providerHealth = getProviderHealth();
  const providers = adapters.map((adapter) => {
    const configured = adapter.enabled();
    const circuit = describeCircuit(`provider:${adapter.label}`);
    const stats = providerHealth[adapter.label];
    return {
      label: adapter.label,
      configured,
      circuitOpen: circuit.open,
      circuitOpenUntil: circuit.openUntil,
      uptime: stats?.uptime ?? 0,
      errorRate: stats?.errorRate ?? 0,
      avgMs: stats?.avgMs ?? 0,
      lastError: stats?.lastError,
    };
  });

  const status = supabase.status === "error" || jobber.status === "error" ? "degraded" : "ok";

  const counters = getCounters();
  const jobberMetrics = {
    ingests: counters["jobber.ingest"] || 0,
    ingestErrors: counters["jobber.ingest.errors"] || 0,
  };

  const payload = {
    status,
    supabase,
    jobber,
    external,
    providerHealth,
    providers,
    jobberMetrics,
    statusCodes: {
      supabase: supabase.statusCode ?? 0,
      jobber: jobber.statusCode ?? 0,
      providers: providers.some((p) => p.circuitOpen) ? 299 : 200,
    },
  };

  logStructured("info", "health_check", { correlationId, status, providerHealth });

  return NextResponse.json(payload, { headers: { "x-correlation-id": correlationId } });
}
