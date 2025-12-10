import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export type EnrichmentPayload = {
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  square_feet?: number | null;
  rent_estimate?: number | null;
  source?: string | null;
};

export type EnrichmentRow = EnrichmentPayload & {
  id?: string;
  jobber_request_id: string;
  refreshed_at?: string | null;
  created_at?: string;
};

function isFresh(refreshedAt: string | null | undefined, maxAgeHours = 12) {
  if (!refreshedAt) return false;
  const refreshedTime = new Date(refreshedAt).getTime();
  if (!Number.isFinite(refreshedTime)) return false;
  const maxAgeMs = maxAgeHours * 60 * 60 * 1000;
  return Date.now() - refreshedTime < maxAgeMs;
}

export async function getCachedEnrichment(
  jobberRequestId: string,
  maxAgeHours = 12
): Promise<EnrichmentRow | null> {
  const { data, error } = await supabase
    .from("property_enrichment")
    .select("*")
    .eq("jobber_request_id", jobberRequestId)
    .order("refreshed_at", { ascending: false })
    .limit(1)
    .maybeSingle<EnrichmentRow>();

  if (error) {
    console.error("Failed to fetch cached enrichment", error);
    return null;
  }

  if (!data || !isFresh(data.refreshed_at, maxAgeHours)) return null;
  return data;
}

export async function getCachedEnrichmentByAddress(
  address: string,
  maxAgeHours = 12
): Promise<EnrichmentRow | null> {
  const { data, error } = await supabase
    .from("property_enrichment")
    .select("*")
    .eq("address", address)
    .order("refreshed_at", { ascending: false })
    .limit(1)
    .maybeSingle<EnrichmentRow>();

  if (error) {
    console.error("Failed to fetch cached enrichment by address", error);
    return null;
  }

  if (!data || !isFresh(data.refreshed_at, maxAgeHours)) return null;
  return data;
}

export async function storeEnrichment(
  requestId: string,
  payload: EnrichmentPayload
): Promise<EnrichmentRow> {
  const row: EnrichmentRow = {
    jobber_request_id: requestId,
    ...payload,
    refreshed_at: new Date().toISOString(),
  };

  const { error } = await supabase.from("property_enrichment").upsert(row, {
    onConflict: "jobber_request_id",
  });

  if (error) {
    console.error("Failed to store enrichment", error);
    throw error;
  }

  return row;
}
