import { requireAdminClient, supabaseEnabled } from "./supabase/server";
import { AerialInsight, PropertyProfile, PropertyRecord, ClientRecord, ServiceRequestRecord, ServiceProfileType } from "./types";
import { scoreProperty } from "./scoring";
import { enrichProperty } from "./enrichment";
import { logIngestionEvent } from "./utils/ingestion";
import { generateNarrative, computeConfidence, computeQualityIndex, computeTrends, classifyTaxonomy, computeMistrustScore } from "./insights_extra";
import { generateServiceInsight, resolveActiveProfiles } from "./service_profiles";
import { ingestFromPlatform } from "./ingestion/platformIngestion";
import { buildQuote } from "./quotes/builder";
import { saveQuote } from "./quotes/store";
import { cacheInsight } from "./utils/cacheLayer";

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1430285561322-7808604715df?auto=format&fit=crop&w=1200&q=80",
];

type PropertyRow = {
  id: string;
  jobber_property_id?: string | null;
  address_line1: string;
  address_line2?: string | null;
  city?: string | null;
  province?: string | null;
  postal_code?: string | null;
  country?: string | null;
  beds?: number | null;
  baths?: number | null;
  sqft?: number | null;
  lot_size_sqft?: number | null;
  year_built?: number | null;
  images?: string[] | null;
  updated_at?: string | null;
};

type PropertyRowWithRelations = PropertyRow & {
  clients?: Array<{
    id: string;
    jobber_client_id?: string | null;
    first_name?: string | null;
    last_name?: string | null;
    email?: string | null;
    phone?: string | null;
  }>;
  service_requests?: Array<{
    id: string;
    jobber_request_id?: string | null;
    title?: string | null;
    status?: string | null;
    description?: string | null;
    requested_at?: string | null;
  }>;
};

export function mockProperty(address?: string): PropertyRecord {
  return {
    address: {
      line1: address || "123 Harbor Lane",
      city: "Southold",
      province: "NY",
      postalCode: "11971",
      country: "USA",
    },
    beds: 3,
    baths: 2,
    sqft: 1650,
    lotSizeSqft: 7405,
    yearBuilt: 1998,
    images: FALLBACK_IMAGES,
  };
}

export function buildProfileFromRecord(
  property: PropertyRecord,
  client?: ClientRecord | null,
  requests?: ServiceRequestRecord[],
  enrichment?: PropertyProfile["enrichment"],
  serviceProfile?: ServiceProfileType,
  aerial?: AerialInsight | null
): PropertyProfile {
  const { insight } = scoreProperty(property);
  const provenance = enrichment ? { sources: enrichment.sources, errors: enrichment.errors, meta: enrichment.meta } : undefined;
  const narrative = generateNarrative(property, insight);
  const confidenceScore = computeConfidence(insight, provenance);
  const qualityIndex = computeQualityIndex(insight, provenance);
  const trends = computeTrends(insight);
  const taxonomy = classifyTaxonomy(property);
  const mistrustScore = computeMistrustScore(provenance);
  const activeProfiles = resolveActiveProfiles(serviceProfile);
  const serviceSpecific = activeProfiles.map((p) => generateServiceInsight(p, property, insight, provenance?.errors || [], aerial || undefined));
  const profile: PropertyProfile = {
    property,
    client,
    requests,
    insights: {
      ...insight,
      provenance,
      narrative,
      confidenceScore,
      qualityIndex,
      trends,
      taxonomy,
      mistrustScore,
      serviceProfile,
      serviceSpecific: serviceSpecific[0]?.details,
      aerialInsights: aerial || enrichment?.aerial,
    },
    enrichment: enrichment ? { ...enrichment, aerial: aerial || enrichment.aerial } : aerial ? { sources: [], errors: [], meta: {}, aerial } : enrichment,
  };
  return profile;
}

export async function fetchStoredProfiles(): Promise<PropertyProfile[]> {
  if (!supabaseEnabled) {
    try {
      const platformResult = await ingestFromPlatform({ dryRun: true, limit: 10 });
      if (platformResult.properties.length) {
        return platformResult.properties.map((p) => buildProfileFromRecord(p));
      }
    } catch {
      // fall back to mock profile when platform ingest not available
    }
    return [buildProfileFromRecord(mockProperty())];
  }

  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("properties")
    .select(
      `id, jobber_property_id, address_line1, address_line2, city, province, postal_code, country, beds, baths, sqft, lot_size_sqft, year_built, images, updated_at`
    )
    .limit(50);

  if (error) throw error;

  const profiles: PropertyProfile[] = (data as PropertyRow[] | null || []).map((row) => {
    const property: PropertyRecord = {
      id: row.id,
      jobberPropertyId: row.jobber_property_id || undefined,
      address: {
        line1: row.address_line1,
        line2: row.address_line2 || undefined,
        city: row.city || undefined,
        province: row.province || undefined,
        postalCode: row.postal_code || undefined,
        country: row.country || undefined,
      },
    beds: row.beds || undefined,
    baths: row.baths || undefined,
    sqft: row.sqft || undefined,
    lotSizeSqft: row.lot_size_sqft || undefined,
    yearBuilt: row.year_built || undefined,
    images: row.images || undefined,
    updatedAt: row.updated_at || undefined,
  };
    return buildProfileFromRecord(property);
  });

  return profiles;
}

export async function fetchProfileById(id: string): Promise<PropertyProfile | null> {
  if (!supabaseEnabled) {
    return buildProfileFromRecord(mockProperty());
  }

  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("properties")
    .select("*, clients(*), service_requests(*)")
    .eq("id", id)
    .maybeSingle();

  if (error) throw error;
  if (!data) return null;
  const record = data as PropertyRowWithRelations;

  const property: PropertyRecord = {
    id: record.id,
    jobberPropertyId: record.jobber_property_id || undefined,
    address: {
      line1: record.address_line1,
      line2: record.address_line2 || undefined,
      city: record.city || undefined,
      province: record.province || undefined,
      postalCode: record.postal_code || undefined,
      country: record.country || undefined,
    },
    beds: record.beds || undefined,
    baths: record.baths || undefined,
    sqft: record.sqft || undefined,
    lotSizeSqft: record.lot_size_sqft || undefined,
    yearBuilt: record.year_built || undefined,
    updatedAt: record.updated_at || undefined,
    images: record.images || FALLBACK_IMAGES,
  };

  const client: ClientRecord | null = record.clients?.[0]
    ? {
        id: record.clients[0].id,
        jobberClientId: record.clients[0].jobber_client_id || undefined,
        firstName: record.clients[0].first_name || undefined,
        lastName: record.clients[0].last_name || undefined,
        email: record.clients[0].email || undefined,
        phone: record.clients[0].phone || undefined,
      }
    : null;

  const requests: ServiceRequestRecord[] = (record.service_requests || []).map((r: PropertyRowWithRelations["service_requests"][number]) => ({
    id: r.id,
    jobberRequestId: r.jobber_request_id || undefined,
    title: r.title || undefined,
    status: r.status || undefined,
    description: r.description || undefined,
    requestedAt: r.requested_at || undefined,
  }));

  return buildProfileFromRecord(property, client, requests);
}

export async function createInsightFromAddress(address: string, persist = true): Promise<PropertyProfile> {
  const property = mockProperty(address);
  property.updatedAt = new Date().toISOString();
  const profile = buildProfileFromRecord(property);

  if (supabaseEnabled && persist) {
    const admin = requireAdminClient();
    const { data, error } = await admin
      .from("properties")
      .upsert({
        address_line1: property.address.line1,
        address_line2: property.address.line2,
        city: property.address.city,
        province: property.address.province,
        postal_code: property.address.postalCode,
        country: property.address.country,
        beds: property.beds,
        baths: property.baths,
        sqft: property.sqft,
        lot_size_sqft: property.lotSizeSqft,
        year_built: property.yearBuilt,
        images: property.images,
        updated_at: new Date().toISOString(),
      })
      .select("id")
      .maybeSingle();

    if (error) throw error;
    if (data?.id) profile.property.id = data.id;
  }

  return profile;
}

export async function buildEnrichedProfile(address: string, persist = true, serviceProfile?: ServiceProfileType): Promise<PropertyProfile> {
  const baseProperty = mockProperty(address);
  const { property, sources, errors, meta, aerial } = await enrichProperty(address).catch(() => ({
    property: baseProperty,
    sources: [],
    errors: [],
    meta: {},
    aerial: undefined,
  }));

  if (errors.length || sources.length) {
    await logIngestionEvent({
      source: "enrichment",
      status: errors.length ? "partial" : "success",
      detail: { sources, errors, address },
    }).catch(() => {});
  }

  if (supabaseEnabled) {
    try {
      const admin = requireAdminClient();
      const updatedAt = new Date().toISOString();
      property.updatedAt = updatedAt;
      if (persist) {
        const payload = {
          jobber_property_id: property.jobberPropertyId,
          address_line1: property.address.line1,
          address_line2: property.address.line2,
          city: property.address.city,
          province: property.address.province,
          postal_code: property.address.postalCode,
          country: property.address.country,
          beds: property.beds,
          baths: property.baths,
          sqft: property.sqft,
          lot_size_sqft: property.lotSizeSqft,
          year_built: property.yearBuilt,
          images: property.images,
          updated_at: updatedAt,
        } satisfies Record<string, unknown>;

        const { data: propRow, error: propErr } = await admin
          .from("properties")
          .upsert(payload, { onConflict: "jobber_property_id" })
          .select("id")
          .maybeSingle();

        if (!propErr && propRow?.id) {
          property.id = propRow.id;
          const { insight } = scoreProperty(property);
          const insightPayload = {
            property_id: propRow.id,
            score: insight.score,
            breakdown: insight.breakdown,
            summary: insight.summary,
            risk_flags: insight.riskFlags,
            recommendations: insight.recommendations,
            valuation: insight.valuation,
            rent_estimate: insight.rentEstimate,
            source: insight.source,
            score_version: insight.scoreVersion,
            enrichment_sources: sources,
            enrichment_errors: errors,
            enrichment_meta: meta,
          } satisfies Record<string, unknown>;
          await admin.from("property_insights").insert(insightPayload);
        }
      }
    } catch (err) {
      console.error("Failed to persist enriched profile", err);
    }
  }

  const enrichment = { sources, errors, meta, aerial };
  const profile = buildProfileFromRecord(property, undefined, undefined, enrichment, serviceProfile, aerial || undefined);
  if (profile.property.id) cacheInsight(profile.property.id, profile);
  if (process.env.AUTO_GENERATE_QUOTES === "true") {
    try {
      const quoteProfile = serviceProfile || "cleaning";
      const quote = buildQuote(profile, quoteProfile as any);
      saveQuote({ ...quote, propertyId: profile.property.id || undefined });
    } catch {
      // best-effort only
    }
  }
  return profile;
}

export function summarizeProfiles(profiles: PropertyProfile[]) {
  const avgScore = profiles.length
    ? Math.round(
        profiles.reduce((acc, p) => acc + (p.insights?.score || 0), 0) / profiles.length
      )
    : 0;

  return {
    total: profiles.length,
    avgScore,
    highRisk: profiles.filter((p) => (p.insights?.riskFlags || []).some((f) => f.severity === "high")).length,
  };
}
