import { NextResponse } from "next/server";
import { requireAdminClient } from "./supabase/server";
import { JobberTokenRow, ServiceRequestRecord, ClientRecord, PropertyRecord } from "./types";
import { pickFirst } from "./utils/validation";
import { logIngestionEvent } from "./utils/ingestion";
import { validateJobberNode, JobberRequestNode } from "./jobber/validation";
import { normalizeAddress } from "./utils/address";

const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";
const DEFAULT_JOBBER_AUTH_URL = "https://api.getjobber.com/api/oauth/authorize";
const JOBBER_TOKEN_URL = process.env.JOBBER_TOKEN_URL || "https://api.getjobber.com/api/oauth/token";

export function resolveBaseUrl(origin?: string) {
  const vercelUrl = process.env.VERCEL_URL
    ? (process.env.VERCEL_URL.startsWith("http") ? process.env.VERCEL_URL : `https://${process.env.VERCEL_URL}`)
    : undefined;
  const candidates = [
    origin,
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.URL,
    process.env.DEPLOY_PRIME_URL,
    vercelUrl,
  ].filter(Boolean) as string[];

  for (const candidate of candidates) {
    try {
      const parsed = new URL(candidate);
      return parsed.origin;
    } catch {
      continue;
    }
  }

  return undefined;
}

export function resolveJobberRedirectUri(origin?: string) {
  const base = resolveBaseUrl(origin);
  const redirectEnv = process.env.JOBBER_REDIRECT_URI;
  const redirectPath = redirectEnv && redirectEnv.startsWith("/") ? redirectEnv : redirectEnv || "/api/jobber/callback";

  if (!base && !redirectEnv) {
    throw new Error("JOBBER_REDIRECT_URI not provided and app base URL missing; set NEXT_PUBLIC_APP_URL (or URL/DEPLOY_PRIME_URL on Netlify).");
  }

  if (!base && redirectEnv && !redirectEnv.startsWith("http")) {
    throw new Error("JOBBER_REDIRECT_URI must be absolute when app base URL is not set");
  }

  const redirect = redirectEnv && redirectEnv.startsWith("http") ? redirectEnv : new URL(redirectPath, base).toString();
  return redirect;
}

function resolveJobberAuthUrl(origin?: string) {
  const raw = process.env.JOBBER_AUTH_URL || DEFAULT_JOBBER_AUTH_URL;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    url = new URL(DEFAULT_JOBBER_AUTH_URL);
  }

  if (origin) {
    const originUrl = new URL(origin);
    // Avoid redirect loops if misconfigured to point back at this route
    if (url.origin === originUrl.origin && url.pathname.includes("/api/jobber")) {
      return DEFAULT_JOBBER_AUTH_URL;
    }
  }

  return url.toString();
}

export type JobberRequestEdge = {
  node: {
    id: string;
    title?: string | null;
    status?: string | null;
    description?: string | null;
    createdAt?: string | null;
    client?: {
      id?: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      phone?: string | null;
    } | null;
    property?: {
      id?: string;
      address?: {
        line1?: string | null;
        line2?: string | null;
        city?: string | null;
        province?: string | null;
        postalCode?: string | null;
        country?: string | null;
      } | null;
    } | null;
  };
};

/**
 * FIXED TYPE — THIS WAS BREAKING THE BUILD
 */
export type JobberTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  token_type?: string;

  // Jobber error formats (required for TS to compile)
  error?: string;
  error_description?: string;

  // original DB fields
  expires_at?: number;
  jobber_account_id?: string;
};

function normalizeTokenResponse(token: JobberTokenResponse): JobberTokenRow {
  const expiresAt =
    token.expires_at ??
    (token.expires_in ? Math.floor(Date.now() / 1000) + token.expires_in : undefined);
  return { ...token, expires_at: expiresAt } as JobberTokenRow;
}

export function buildJobberAuthUrl(origin?: string) {
  if (!process.env.JOBBER_CLIENT_ID || !process.env.JOBBER_CLIENT_SECRET) {
    throw new Error("Jobber OAuth env vars are missing. Set JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET.");
  }

  const authUrl = new URL(resolveJobberAuthUrl(origin));
  const redirectUri = resolveJobberRedirectUri(origin);

  authUrl.searchParams.set("client_id", process.env.JOBBER_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "read write");
  return authUrl.toString();
}

export async function exchangeCodeForTokens(code: string, origin?: string) {
  if (!process.env.JOBBER_CLIENT_ID || !process.env.JOBBER_CLIENT_SECRET) {
    throw new Error("Jobber OAuth env vars are missing. Set JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET.");
  }

  const redirectUri = resolveJobberRedirectUri(origin);

  const res = await fetch(JOBBER_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.JOBBER_CLIENT_ID + ":" + process.env.JOBBER_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const tokenData = (await res.json()) as JobberTokenResponse;
  if (!res.ok || !tokenData.access_token) {
    throw new Error(
      `Failed to exchange OAuth code for tokens (${res.status}): ${tokenData.error_description || tokenData.error || "unknown error"}`
    );
  }

  return normalizeTokenResponse(tokenData);
}

export async function refreshJobberToken(refreshToken: string) {
  if (!process.env.JOBBER_CLIENT_ID || !process.env.JOBBER_CLIENT_SECRET) {
    throw new Error("Jobber OAuth env vars are missing. Set JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET.");
  }

  const res = await fetch(JOBBER_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.JOBBER_CLIENT_ID + ":" + process.env.JOBBER_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const tokenData = (await res.json()) as JobberTokenResponse;
  if (!res.ok) {
    throw new Error("Failed to refresh Jobber token: " + JSON.stringify(tokenData));
  }
  return normalizeTokenResponse(tokenData);
}

export async function fetchJobberBusinessId(accessToken: string) {
  const graphqlRes = await fetch(JOBBER_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query { viewer { business { id } } }`,
    }),
  });

  const data = await graphqlRes.json();
  return data?.data?.viewer?.business?.id || null;
}

export async function storeJobberTokens(tokenData: Partial<JobberTokenRow> & { access_token: string }) {
  const admin = requireAdminClient();
  const jobberAccountId = tokenData.jobber_account_id || (await fetchJobberBusinessId(tokenData.access_token));

  const insertRes = await admin
    .from("jobber_tokens")
    .upsert({
      jobber_account_id: jobberAccountId,
      access_token: tokenData.access_token,
      refresh_token: tokenData.refresh_token,
      expires_at: tokenData.expires_at,
    })
    .select()
    .maybeSingle();

  if (insertRes.error) {
    throw insertRes.error;
  }
  return insertRes.data as JobberTokenRow;
}

export async function getLatestJobberTokens() {
  const admin = requireAdminClient();
  const { data, error } = await admin
    .from("jobber_tokens")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data as JobberTokenRow | null;
}

export function isTokenStale(token: JobberTokenRow | null) {
  if (token?.expires_at === undefined || token?.expires_at === null) return false;
  const now = Date.now();
  // consider stale if expiry in next 5 minutes
  return token.expires_at * 1000 < now + 5 * 60 * 1000;
}

export type AccessTokenResult = {
  accessToken: string;
  tokenStatus: "fresh" | "refreshed" | "stale" | "stale-refresh-failed" | "stale-no-refresh";
  tokenRow?: JobberTokenRow | null;
};

export async function ensureJobberAccessToken(
  tokenRow?: JobberTokenRow | null,
  deps?: {
    refresh?: (refreshToken: string) => Promise<JobberTokenRow>;
    store?: (row: Partial<JobberTokenRow> & { access_token: string }) => Promise<JobberTokenRow>;
    getLatest?: () => Promise<JobberTokenRow | null>;
  }
): Promise<AccessTokenResult> {
  const getLatest = deps?.getLatest ?? getLatestJobberTokens;
  const existing = tokenRow ?? (await getLatest());
  if (!existing?.access_token) {
    throw new Error("No Jobber token available");
  }

  if (!isTokenStale(existing)) {
    return { accessToken: existing.access_token, tokenStatus: "fresh", tokenRow: existing };
  }

  if (!existing.refresh_token) {
    return { accessToken: existing.access_token, tokenStatus: "stale-no-refresh", tokenRow: existing };
  }

  const refreshFn = deps?.refresh ?? refreshJobberToken;
  const storeFn = deps?.store ?? storeJobberTokens;

  try {
    const refreshed = await refreshFn(existing.refresh_token);
    const stored = await storeFn({
      ...refreshed,
      jobber_account_id: existing.jobber_account_id,
      expires_at: refreshed.expires_at,
    });
    return { accessToken: stored.access_token, tokenStatus: "refreshed", tokenRow: stored };
  } catch {
    return { accessToken: existing.access_token, tokenStatus: "stale-refresh-failed", tokenRow: existing };
  }
}

export async function fetchRecentJobberRequests(accessToken: string, limit = 10): Promise<JobberRequestEdge[]> {
  const RECENT_REQUESTS_QUERY = `
    query RecentRequests($first: Int!) {
      requests(first: $first, orderBy: { field: CREATED_AT, direction: DESC }) {
        edges {
          node {
            id
            title
            status
            createdAt
            description
            client { id firstName lastName email phone }
            property {
              id
              address { line1 line2 city province postalCode country }
            }
          }
        }
      }
    }
  `;

  const jobberRes = await fetch(JOBBER_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: RECENT_REQUESTS_QUERY, variables: { first: limit } }),
  });

  const text = await jobberRes.text();
  if (!jobberRes.ok) {
    throw new Error("Jobber GraphQL request failed: " + text);
  }
  const json = JSON.parse(text);
  const edges = (json?.data?.requests?.edges as JobberRequestEdge[] | undefined) ?? [];
  return edges.filter((edge) => edge?.node?.id);
}

export async function fetchJobberClient(accessToken: string, clientId: string) {
  const CLIENT_QUERY = `
    query Client($id: ID!) {
      client(id: $id) {
        id
        firstName
        lastName
        email
        phone
        properties(first: 5) { edges { node { id address { line1 city province postalCode } } } }
      }
    }
  `;

  const res = await fetch(JOBBER_GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${accessToken}`,
    },
    body: JSON.stringify({ query: CLIENT_QUERY, variables: { id: clientId } }),
  });

  const text = await res.text();
  if (!res.ok) {
    throw new Error("Jobber GraphQL client fetch failed: " + text);
  }
  return JSON.parse(text);
}

function assertEdgeValid(edge: JobberRequestEdge) {
  if (!edge?.node?.id) {
    throw new Error("Invalid Jobber edge: missing node id");
  }
}

export function mapJobberEdgeToRecords(edge: JobberRequestEdge) {
  assertEdgeValid(edge);
  const validated: JobberRequestNode = validateJobberNode(edge.node);
  const client = validated.client || {};
  const property = validated.property || {};
  const address = normalizeAddress(property.address || {});

  const clientRecord: ClientRecord = {
    jobberClientId: client.id,
    firstName: client.firstName,
    lastName: client.lastName,
    email: client.email,
    phone: client.phone,
  };

  const propertyRecord: PropertyRecord = {
    jobberPropertyId: property.id,
    address: {
      line1: pickFirst(address.line1, "Unknown address") || "Unknown address",
      line2: address.line2 || undefined,
      city: address.city || undefined,
      province: address.province || undefined,
      postalCode: address.postalCode || undefined,
      country: address.country || undefined,
    },
  };

  const requestRecord: ServiceRequestRecord = {
    jobberRequestId: validated.id,
    title: validated.title || undefined,
    status: validated.status || undefined,
    description: validated.description || undefined,
    requestedAt: validated.createdAt || undefined,
  };

  return { clientRecord, propertyRecord, requestRecord };
}

export async function ingestJobberRequests(edges: JobberRequestEdge[]) {
  const admin = requireAdminClient();
  let ingested = 0;
  let skipped = 0;
  const errors: string[] = [];
  const summaries: Array<{ id: string; client?: string | null; property?: string | null }> = [];

  for (const edge of edges) {
    try {
      const { clientRecord, propertyRecord, requestRecord } = mapJobberEdgeToRecords(edge);

      const clientRes = await admin
        .from("clients")
        .upsert(
          {
            jobber_client_id: clientRecord.jobberClientId,
            first_name: clientRecord.firstName,
            last_name: clientRecord.lastName,
            email: clientRecord.email,
            phone: clientRecord.phone,
          },
          { onConflict: "jobber_client_id" }
        )
        .select("id")
        .maybeSingle();
      if (clientRes.error) throw clientRes.error;
      const clientId = clientRes.data?.id;

      const propertyRes = await admin
        .from("properties")
        .upsert(
          {
            jobber_property_id: propertyRecord.jobberPropertyId,
            address_line1: propertyRecord.address.line1,
            address_line2: propertyRecord.address.line2,
            city: propertyRecord.address.city,
            province: propertyRecord.address.province,
            postal_code: propertyRecord.address.postalCode,
            country: propertyRecord.address.country,
            beds: propertyRecord.beds,
            baths: propertyRecord.baths,
            sqft: propertyRecord.sqft,
            lot_size_sqft: propertyRecord.lotSizeSqft,
            year_built: propertyRecord.yearBuilt,
            images: propertyRecord.images,
          },
          { onConflict: "jobber_property_id" }
        )
        .select("id")
        .maybeSingle();
      if (propertyRes.error) throw propertyRes.error;
      const propertyId = propertyRes.data?.id;

      const requestPayload = {
        jobber_request_id: requestRecord.jobberRequestId,
        title: requestRecord.title,
        status: requestRecord.status,
        description: requestRecord.description,
        requested_at: requestRecord.requestedAt,
        client_id: clientId ?? null,
        property_id: propertyId ?? null,
      };

      const reqRes = await admin
        .from("service_requests")
        .upsert(requestPayload, { onConflict: "jobber_request_id" });
      if (reqRes.error) throw reqRes.error;

      ingested += 1;
      summaries.push({
        id: requestRecord.jobberRequestId || "",
        client: [clientRecord.firstName, clientRecord.lastName].filter(Boolean).join(" ") || null,
        property: [propertyRecord.address.line1, propertyRecord.address.city].filter(Boolean).join(", ") || null,
      });
    } catch (err) {
      skipped += 1;
      const message = err instanceof Error ? err.message : String(err);
      errors.push(message);
    }
  }

  try {
    await logIngestionEvent({
      source: "jobber",
      status: errors.length ? "partial" : "success",
      platform: "jobber",
      detail: { ingested, skipped, errors },
    });
  } catch {
    // swallow logging errors
  }

  return { ingested, skipped, errors, summaries };
}

export function missingJobberEnvResponse() {
  return NextResponse.json(
    {
      error: "Missing Jobber OAuth environment variables",
      required: [
        "JOBBER_AUTH_URL",
        "JOBBER_CLIENT_ID",
        "JOBBER_CLIENT_SECRET",
        "JOBBER_REDIRECT_URI",
      ],
    },
    { status: 500 }
  );
}
