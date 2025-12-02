import { requireAdminClient, supabaseEnabled } from "@/lib/supabase/server";

export type IngestionEventPayload = {
  source: string;
  status: string;
  detail?: Record<string, unknown>;
  platform?: string | null;
  propertyId?: string | null;
};

export async function logIngestionEvent(payload: IngestionEventPayload) {
  if (!supabaseEnabled) return;
  const admin = requireAdminClient();
  await admin.from("ingestion_events").insert({
    source: payload.source,
    status: payload.status,
    detail: payload.detail ?? null,
    platform: payload.platform ?? null,
  });
}
