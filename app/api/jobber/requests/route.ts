// app/api/jobber/requests/route.ts
// Fetches Jobber requests, normalizes them, enriches properties, and returns dashboard-ready rows.

import { NextRequest, NextResponse } from "next/server";
import { getAnyJobberAccessToken, getJobberAccessTokenForAccount } from "@/lib/jobberTokens";
import { getAccountByJobberAccountId, incrementUsage } from "@/lib/accounts";
import { logError, logInfo } from "@/lib/logging";
import { getCurrentUserFromRequest } from "@/lib/currentUser";
import { isDemoModeEnabled } from "@/lib/featureFlags";
import { demoProperties } from "@/lib/demo/demoProperties";
import { demoRequests } from "@/lib/demo/demoRequests";
import { normalizeAddress, formatAddress } from "@/lib/utils/address";
import { requireAdminClient, supabaseEnabled } from "@/lib/supabase/server";
import { JOBBER_GRAPHQL_API_VERSION } from "@/lib/jobber";

export type RequestAddress = {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postalCode?: string;
  country?: string;
};

export type Enrichment = {
  provider: "rentcast" | "zillow" | "fallback";
  beds?: number;
  baths?: number;
  sqft?: number;
  lotSizeSqft?: number;
  yearBuilt?: number;
  estimatedValue?: number;
  latitude?: number;
  longitude?: number;
  mapImageUrl?: string | null;
  valuationLow?: number;
  valuationHigh?: number;
  status?: "pending" | "enriched" | "failed";
};

export type RequestItem = {
  id: string;
  jobberRequestId?: string;
  jobberAccountId: string;
  status: string;
  createdAt: string;
  updatedAt?: string;
  title?: string;
  contactName?: string;
  addressString?: string;
  address?: RequestAddress;
  enrichment: Enrichment | null;
  enrichmentStatus?: "pending" | "enriched" | "failed";
  mapImageUrl?: string | null;
  estimatedValue?: number | null;
  property?: {
    bedrooms?: number | null;
    bathrooms?: number | null;
    squareFeet?: number | null;
    lotSizeSqFt?: number | null;
    yearBuilt?: number | null;
    priceEstimate?: number | null;
    raw?: unknown;
  } | null;
  raw: Record<string, unknown> | null;
};

type JobberRequestAddressPayload = {
  street?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  full?: string;
};

type JobberRequestNode = {
  id?: string;
  createdAt?: string;
  status?: string;
  title?: string;
  description?: string;
  url?: string | null;
  client?: {
    name?: string;
    address?: JobberRequestAddressPayload | null;
  } | null;
  property?: {
    address?: JobberRequestAddressPayload | null;
  } | null;
};

type JobberRequestEdge = { node?: JobberRequestNode | null };
type JobberGraphResponse = {
  data?: { requests?: { edges?: JobberRequestEdge[] } };
  errors?: unknown;
};

function formatJobberGraphqlError(status: number, raw: string) {
  let message: string | undefined;
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed?.errors) && parsed.errors.length) {
      const first = parsed.errors[0];
      message =
        first?.message ||
        (typeof first === "string" ? first : undefined);
    } else if (parsed?.error) {
      message = parsed.error;
    }
  } catch {
    // ignore parse errors
  }

  const snippet = (message || raw || "")
    .toString()
    .replace(/\s+/g, " ")
    .slice(0, 200);

  return `Jobber GraphQL error (${status}): ${snippet || "unknown error"}`;
}

const MOCK_MODE = (process.env.MOCK_JOBBER_REQUESTS || "").toLowerCase() === "true";
const ENRICH_CHUNK = 5;
const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

function buildAddressString(node: JobberRequestNode): { address: RequestAddress; addressString: string } {
  const propertyAddress = node.property?.address || {};
  const clientAddress = node.client?.address || {};
  const raw = propertyAddress.full || clientAddress.full;
  const normalized = normalizeAddress({
    line1: propertyAddress.street || clientAddress.street || raw || "",
    city: propertyAddress.city || clientAddress.city || undefined,
    province: propertyAddress.province || clientAddress.province || undefined,
    postalCode: propertyAddress.postalCode || clientAddress.postalCode || undefined,
    country: propertyAddress.country || clientAddress.country || undefined,
  });
  const address: RequestAddress = {
    line1: normalized.line1 || undefined,
    city: normalized.city || undefined,
    state: normalized.province || undefined,
    postalCode: normalized.postalCode || undefined,
    country: normalized.country || undefined,
  };
  const addressString =
    raw ||
    formatAddress({
      line1: normalized.line1,
      line2: normalized.line2,
      city: normalized.city,
      province: normalized.province,
      postalCode: normalized.postalCode,
      country: normalized.country,
      latitude: normalized.latitude,
      longitude: normalized.longitude,
    });
  return { address, addressString };
}

async function fetchJobberRequestsNormalized(accessToken: string, jobberAccountId: string): Promise<RequestItem[]> {
  const query = `
    query Requests($first: Int!) {
      requests(first: $first, orderBy: { field: CREATED_AT, direction: DESC }) {
        edges {
          node {
            id
            createdAt
            status
            title
            description
            url
            client {
              name
              address {
                street
                city
                province
                postalCode
                country
              }
            }
            property {
              address {
                street
                city
                province
                postalCode
                country
              }
            }
          }
        }
      }
    }
  `;

  const graphRes = await fetch("https://api.getjobber.com/api/graphql", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
      "X-Jobber-Graphql-Version": JOBBER_GRAPHQL_API_VERSION,
    },
    body: JSON.stringify({
      query,
      operationName: "Requests",
      variables: { first: 20 },
    }),
  });

  const graphText = await graphRes.text();
  let graphJson: JobberGraphResponse;
  try {
    graphJson = JSON.parse(graphText) as JobberGraphResponse;
  } catch (err) {
    console.error("Failed to parse Jobber GraphQL response", err);
    const error = new Error(
      formatJobberGraphqlError(graphRes.status, graphText)
    );
    (error as any).status = graphRes.status;
    throw error;
  }

  if (!graphRes.ok || graphJson.errors) {
    const error = new Error(
      formatJobberGraphqlError(graphRes.status, graphText)
    );
    (error as any).status = graphRes.status;
    throw error;
  }

  const edges = graphJson?.data?.requests?.edges ?? [];

  return edges.map((edge) => {
    const node: JobberRequestNode = edge?.node ?? {};
    const { address, addressString } = buildAddressString(node);

    return {
      id: node.id ?? "",
      jobberRequestId: node.id ?? "",
      jobberAccountId: jobberAccountId ?? "unknown",
      status: node.status ?? "",
      createdAt: node.createdAt ?? "",
      title: node.title ?? "",
      contactName: node.client?.name ?? undefined,
      address,
      addressString,
      enrichment: null,
      enrichmentStatus: addressString ? "pending" : "failed",
      mapImageUrl: null,
      estimatedValue: null,
      property: {
        raw: node.property ?? null,
      },
      raw: node as Record<string, unknown>,
    };
  });
}

async function savePropertyRecord(request: RequestItem, enrichment: Enrichment | null) {
  if (!supabaseEnabled) return;
  try {
    const admin = requireAdminClient();
    const row = {
      jobber_request_id: request.id,
      address: request.addressString ?? "",
      beds: enrichment?.beds ?? null,
      baths: enrichment?.baths ?? null,
      sqft: enrichment?.sqft ?? null,
      lot_size: enrichment?.lotSizeSqft ?? null,
      year_built: enrichment?.yearBuilt ?? null,
      latitude: enrichment?.latitude ?? null,
      longitude: enrichment?.longitude ?? null,
      estimated_value: enrichment?.estimatedValue ?? null,
      map_image_url: enrichment?.mapImageUrl ?? null,
      created_at: new Date().toISOString(),
    };

    await admin.from("properties").upsert(row, { onConflict: "jobber_request_id" });
  } catch (err) {
    console.error("Failed to upsert property record", err);
  }
}

async function enrichRequests(requests: RequestItem[], accountId: string | null) {
  const result = [...requests];
  for (let i = 0; i < result.length; i += ENRICH_CHUNK) {
    const slice = result.slice(i, i + ENRICH_CHUNK);
    const lookups = slice.map(async (item) => {
      if (!item.addressString) {
        item.enrichmentStatus = "failed";
        return item;
      }

      try {
        const res = await fetch(`${BASE_URL}/api/property/enrich`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ address: item.addressString }),
          cache: "no-store",
        });

        if (!res.ok) {
          item.enrichmentStatus = "failed";
          return item;
        }

        const data = await res.json();
        const enrichment: Enrichment = {
          provider: data.provider ?? "rentcast",
          beds: data.beds ?? undefined,
          baths: data.baths ?? undefined,
          sqft: data.sqft ?? undefined,
          lotSizeSqft: data.lotSize ?? undefined,
          yearBuilt: data.yearBuilt ?? undefined,
          estimatedValue: data.estimatedValue ?? undefined,
          latitude: data.latitude ?? undefined,
          longitude: data.longitude ?? undefined,
          mapImageUrl: data.mapImageUrl ?? null,
          valuationLow: data.valuationLow ?? undefined,
          valuationHigh: data.valuationHigh ?? undefined,
          status: "enriched",
        };

        item.enrichment = enrichment;
        item.enrichmentStatus = "enriched";
        item.mapImageUrl = enrichment.mapImageUrl ?? null;
        item.estimatedValue = enrichment.estimatedValue ?? null;
        item.property = {
          bedrooms: enrichment.beds ?? item.property?.bedrooms ?? null,
          bathrooms: enrichment.baths ?? item.property?.bathrooms ?? null,
          squareFeet: enrichment.sqft ?? item.property?.squareFeet ?? null,
          lotSizeSqFt: enrichment.lotSizeSqft ?? item.property?.lotSizeSqFt ?? null,
          yearBuilt: enrichment.yearBuilt ?? item.property?.yearBuilt ?? null,
          priceEstimate: enrichment.estimatedValue ?? item.property?.priceEstimate ?? null,
          raw: item.property?.raw,
        };

        await savePropertyRecord(item, enrichment);
        if (accountId) incrementUsage(accountId, "properties_enriched", 1).catch(() => {});
      } catch (err) {
        console.error("Failed to enrich request", err);
        item.enrichmentStatus = "failed";
      }

      return item;
    });

    await Promise.allSettled(lookups);
  }
  return result;
}

export async function GET(request: NextRequest) {
  try {
    // Demo mode fast-path
    if (isDemoModeEnabled()) {
      const merged = demoRequests.map((req) => ({
        ...req,
        enrichment: demoProperties[req.id] ?? req.enrichment,
        enrichmentStatus: demoProperties[req.id] ? "enriched" : "pending",
        mapImageUrl: demoProperties[req.id]?.mapImageUrl ?? null,
        estimatedValue: demoProperties[req.id]?.estValue ?? null,
      }));
      return NextResponse.json({ requests: merged });
    }

    // Mock mode fast-path
    if (MOCK_MODE) {
      const merged = demoRequests.map((req) => ({
        ...req,
        enrichment: demoProperties[req.id] ?? req.enrichment,
        enrichmentStatus: "enriched",
      }));
      return NextResponse.json({ requests: merged });
    }

    const user = await getCurrentUserFromRequest(request);
    const searchParams = new URL(request.url).searchParams;
    const requestedAccountId = searchParams.get("jobber_account_id")?.trim() || null;

    let accessToken: string | null = null;
    let jobberAccountId: string | null = null;
    let accountId: string | null = null;

    if (requestedAccountId) {
      try {
        const token = await getJobberAccessTokenForAccount(requestedAccountId);
        if (token) {
          accessToken = token.accessToken;
          jobberAccountId = requestedAccountId;
        }
      } catch (tokenErr) {
        const message = tokenErr instanceof Error ? tokenErr.message : "Unable to resolve Jobber token.";
        return NextResponse.json({ error: "token_resolution_failed", message }, { status: 500 });
      }
    }

    if (!accessToken || !jobberAccountId) {
      try {
        const token = await getAnyJobberAccessToken();
        if (token) {
          accessToken = token.accessToken;
          jobberAccountId = token.jobberAccountId;
        }
      } catch (tokenErr) {
        const message = tokenErr instanceof Error ? tokenErr.message : "Unable to resolve Jobber token.";
        return NextResponse.json({ error: "token_resolution_failed", message }, { status: 500 });
      }
    }

    if (!accessToken || !jobberAccountId) {
      return NextResponse.json(
        { error: "missing_token", message: "No Jobber access token found" },
        { status: 401 }
      );
    }

    const accountRow =
      (user?.accountId && { id: user.accountId }) ||
      (await getAccountByJobberAccountId(jobberAccountId));
    accountId = accountRow?.id ?? null;

    logInfo("jobber.requests", "Fetching Jobber requests", {
      jobberAccountId,
      accountId,
    });

    let baseItems: RequestItem[];
    try {
      baseItems = await fetchJobberRequestsNormalized(accessToken, jobberAccountId);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Jobber GraphQL returned an error.";
      logError("jobber.requests", "GraphQL error", { message });
      return NextResponse.json({ error: "jobber_graphql_error", message }, { status: 400 });
    }

    const enriched = await enrichRequests(baseItems, accountId);

    if (accountId) {
      incrementUsage(accountId, "requests_synced", enriched.length).catch(() => {});
    }

    logInfo("jobber.requests", "Requests fetched", {
      count: enriched.length,
      jobberAccountId,
    });

    return NextResponse.json({
      requests: enriched,
    });
  } catch (err: unknown) {
    console.error("Unexpected error in /api/jobber/requests", err);
    logError("jobber.requests", "Unexpected error", { err });
    const message =
      err instanceof Error ? err.message : typeof err === "string" ? err : "Unknown error";
    return NextResponse.json({ error: "unexpected_error", message }, { status: 500 });
  }
}
