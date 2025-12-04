// ===========================================
// lib/jobber.ts — FULL FINAL VERSION (DO NOT EDIT)
// ===========================================

import { requireAdminClient } from "./supabase/server";
import { normalizeAddress } from "./utils/address";
import { pickFirst } from "./utils/validation";
import { logIngestionEvent } from "./utils/ingestion";
import { validateJobberNode, JobberRequestNode } from "./jobber/validation";
import {
  JobberTokenRow,
  ServiceRequestRecord,
  ClientRecord,
  PropertyRecord,
} from "./types";

const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";
const DEFAULT_JOBBER_AUTH_URL =
  "https://api.getjobber.com/api/oauth/authorize";
const DEFAULT_JOBBER_TOKEN_URL =
  "https://api.getjobber.com/api/oauth/token";

// -------------------------------------------
// Base URL Resolution (Netlify / Vercel Safe)
// -------------------------------------------
export function resolveBaseUrl(origin?: string) {
  const vercelUrl = process.env.VERCEL_URL
    ? process.env.VERCEL_URL.startsWith("http")
      ? process.env.VERCEL_URL
      : `https://${process.env.VERCEL_URL}`
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
    } catch {}
  }

  return undefined;
}

export function resolveJobberRedirectUri(origin?: string) {
  const base = resolveBaseUrl(origin);
  const redirectEnv = process.env.JOBBER_REDIRECT_URI;

  const redirectPath =
    redirectEnv && redirectEnv.startsWith("/")
      ? redirectEnv
      : redirectEnv || "/api/jobber/callback";

  if (!base && !redirectEnv)
    throw new Error(
      "JOBBER_REDIRECT_URI missing and no app base URL available."
    );

  if (!base && redirectEnv && !redirectEnv.startsWith("http"))
    throw new Error("JOBBER_REDIRECT_URI must be absolute if base URL missing.");

  return redirectEnv && redirectEnv.startsWith("http")
    ? redirectEnv
    : new URL(redirectPath, base).toString();
}

function resolveJobberAuthUrl(origin?: string) {
  const raw = process.env.JOBBER_AUTH_URL || DEFAULT_JOBBER_AUTH_URL;
  try {
    const parsed = new URL(raw);
    const originUrl = origin ? new URL(origin) : null;

    if (
      originUrl &&
      parsed.origin === originUrl.origin &&
      parsed.pathname.includes("/api/jobber")
    ) {
      return DEFAULT_JOBBER_AUTH_URL;
    }

    return raw;
  } catch {
    return DEFAULT_JOBBER_AUTH_URL;
  }
}

// -------------------------------------------
// Jobber Token Types
// -------------------------------------------
export type JobberTokenResponse = {
  access_token?: string;
  refresh_token?: string;
  expires_in?: number;
  expires_at?: number;
  token_type?: string;

  error?: string;
  error_description?: string;

  jobber_account_id?: string;
};

// -------------------------------------------
// Token Normalization
// -------------------------------------------
function normalizeTokenResponse(
  token: JobberTokenResponse
): JobberTokenRow {
  const expiresAt =
    token.expires_at ??
    (token.expires_in
      ? Math.floor(Date.now() / 1000) + token.expires_in
      : undefined);

  return {
    jobber_account_id: token.jobber_account_id ?? null,
    access_token: token.access_token ?? "",
    refresh_token: token.refresh_token ?? null,
    expires_at: expiresAt ?? null,
  };
}

// -------------------------------------------
// Auth URL Builder
// -------------------------------------------
export function buildJobberAuthUrl(origin?: string) {
  if (!process.env.JOBBER_CLIENT_ID || !process.env.JOBBER_CLIENT_SECRET)
    throw new Error("Missing Jobber OAuth vars.");

  const authUrl = new URL(resolveJobberAuthUrl(origin));
  const redirectUri = resolveJobberRedirectUri(origin);

  authUrl.searchParams.set("client_id", process.env.JOBBER_CLIENT_ID);
  authUrl.searchParams.set("redirect_uri", redirectUri);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "read write");

  return authUrl.toString();
}

// -------------------------------------------
// Exchange OAuth Code for Tokens (Jobber Bug-Safe)
// -------------------------------------------
export async function exchangeCodeForTokens(
  code: string,
  origin?: string
) {
  if (!process.env.JOBBER_CLIENT_ID || !process.env.JOBBER_CLIENT_SECRET)
    throw new Error("Missing Jobber OAuth vars.");

  const TOKEN_URL =
    process.env.JOBBER_TOKEN_URL?.trim() || DEFAULT_JOBBER_TOKEN_URL;

  const redirectUri = resolveJobberRedirectUri(origin);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.JOBBER_CLIENT_ID +
            ":" +
            process.env.JOBBER_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  const raw = await res.text();
  let json: JobberTokenResponse | null = null;

  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(
      `Jobber returned invalid JSON (${res.status}) — starts with: ` +
        raw.slice(0, 150)
    );
  }

  if (!res.ok || !json.access_token) {
    throw new Error(
      `Failed to exchange OAuth code (${res.status}): ` +
        (json.error_description ||
          json.error ||
          JSON.stringify(json))
    );
  }

  return normalizeTokenResponse(json);
}

// -------------------------------------------
// Refresh Token
// -------------------------------------------
export async function refreshJobberToken(refreshToken: string) {
  if (!process.env.JOBBER_CLIENT_ID || !process.env.JOBBER_CLIENT_SECRET)
    throw new Error("Missing Jobber OAuth vars.");

  const TOKEN_URL =
    process.env.JOBBER_TOKEN_URL?.trim() || DEFAULT_JOBBER_TOKEN_URL;

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.JOBBER_CLIENT_ID +
            ":" +
            process.env.JOBBER_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  const raw = await res.text();
  let json: JobberTokenResponse | null = null;

  try {
    json = JSON.parse(raw);
  } catch {
    throw new Error(
      `Jobber returned invalid JSON during refresh (${res.status}).`
    );
  }

  if (!res.ok || !json.access_token) {
    throw new Error(
      `Failed to refresh token (${res.status}): ` +
        JSON.stringify(json)
    );
  }

  return normalizeTokenResponse(json);
}

// -------------------------------------------
// Fetch Business ID
// -------------------------------------------
export async function fetchJobberBusinessId(accessToken: string) {
  const res = await fetch(JOBBER_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      query: `query { viewer { business { id } } }`,
    }),
  });

  const json = await res.json();
  return json?.data?.viewer?.business?.id ?? null;
}

// -------------------------------------------
// Store Tokens in Supabase
// -------------------------------------------
export async function storeJobberTokens(
  tokenData: Partial<JobberTokenRow> & { access_token: string }
) {
  const admin = requireAdminClient();
  const jobberAccountId =
    tokenData.jobber_account_id ??
    (await fetchJobberBusinessId(tokenData.access_token));

  const { data, error } = await admin
    .from("jobber_tokens")
    .upsert(
      {
        jobber_account_id: jobberAccountId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: tokenData.expires_at,
      },
      { onConflict: "jobber_account_id" }
    )
    .select()
    .maybeSingle();

  if (error) throw error;
  return data as JobberTokenRow;
}

// -------------------------------------------
// Get Latest Token
// -------------------------------------------
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

// -------------------------------------------
// Token Freshness Check
// -------------------------------------------
export function isTokenStale(token: JobberTokenRow | null) {
  if (!token?.expires_at) return false;
  return token.expires_at * 1000 < Date.now() + 5 * 60 * 1000;
}

// -------------------------------------------
// Ensure Fresh Token (Auto-Refresh)
// -------------------------------------------
export async function ensureJobberAccessToken(
  tokenRow?: JobberTokenRow | null
) {
  const existing = tokenRow ?? (await getLatestJobberTokens());
  if (!existing?.access_token)
    throw new Error("No Jobber token available.");

  if (!isTokenStale(existing))
    return {
      accessToken: existing.access_token,
      tokenStatus: "fresh" as const,
      tokenRow: existing,
    };

  if (!existing.refresh_token)
    return {
      accessToken: existing.access_token,
      tokenStatus: "stale-no-refresh" as const,
      tokenRow: existing,
    };

  try {
    const refreshed = await refreshJobberToken(
      existing.refresh_token
    );

    const stored = await storeJobberTokens({
      ...refreshed,
      jobber_account_id: existing.jobber_account_id,
    });

    return {
      accessToken: stored.access_token,
      tokenStatus: "refreshed" as const,
      tokenRow: stored,
    };
  } catch {
    return {
      accessToken: existing.access_token,
      tokenStatus: "stale-refresh-failed" as const,
      tokenRow: existing,
    };
  }
}

// -------------------------------------------
// Fetch Recent Requests
// -------------------------------------------
export async function fetchRecentJobberRequests(
  accessToken: string,
  limit = 10
) {
  const query = `
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

  const res = await fetch(JOBBER_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { first: limit } }),
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(`Jobber GraphQL failed: ${raw}`);

  const json = JSON.parse(raw);
  return (json?.data?.requests?.edges ?? []).filter(
    (e: any) => e?.node?.id
  );
}

// -------------------------------------------
// Fetch Client Detail
// -------------------------------------------
export async function fetchJobberClient(
  accessToken: string,
  clientId: string
) {
  const query = `
    query Client($id: ID!) {
      client(id: $id) {
        id
        firstName
        lastName
        email
        phone
        properties(first: 5) {
          edges { node { id address { line1 city province postalCode } } }
        }
      }
    }
  `;

  const res = await fetch(JOBBER_GRAPHQL_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables: { id: clientId } }),
  });

  const raw = await res.text();
  if (!res.ok) throw new Error(`Jobber client fetch failed: ${raw}`);
  return JSON.parse(raw);
}

// -------------------------------------------
// Map Jobber Request to Records
// -------------------------------------------
function assertEdgeValid(edge: any) {
  if (!edge?.node?.id)
    throw new Error("Invalid Jobber edge: missing node id");
}

export function mapJobberEdgeToRecords(edge: any) {
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
      line1:
        pickFirst(address.line1, "Unknown address") ||
        "Unknown address",
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

// -------------------------------------------
// Ingestion — Full Safe Version
// -------------------------------------------
export async function ingestJobberRequests(edges: any[]) {
  const admin = requireAdminClient();
  let ingested = 0;
  let skipped = 0;
  const errors: string[] = [];
  const summaries: any[] = [];

  for (const edge of edges) {
    try {
      const { clientRecord, propertyRecord, requestRecord } =
        mapJobberEdgeToRecords(edge);

      const { data: c, error: cErr } = await admin
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

      if (cErr) throw cErr;

      const clientId = c?.id;

      const { data: p, error: pErr } = await admin
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
          },
          { onConflict: "jobber_property_id" }
        )
        .select("id")
        .maybeSingle();

      if (pErr) throw pErr;

      const propertyId = p?.id;

      const { error: rErr } = await admin
        .from("service_requests")
        .upsert(
          {
            jobber_request_id: requestRecord.jobberRequestId,
            title: requestRecord.title,
            status: requestRecord.status,
            description: requestRecord.description,
            requested_at: requestRecord.requestedAt,
            client_id: clientId ?? null,
            property_id: propertyId ?? null,
          },
          { onConflict: "jobber_request_id" }
        );

      if (rErr) throw rErr;

      ingested++;

      summaries.push({
        id: requestRecord.jobberRequestId,
        client:
          [clientRecord.firstName, clientRecord.lastName]
            .filter(Boolean)
            .join(" ") || null,
        property:
          [
            propertyRecord.address.line1,
            propertyRecord.address.city,
          ]
            .filter(Boolean)
            .join(", ") || null,
      });
    } catch (err: any) {
      skipped++;
      errors.push(err?.message || String(err));
    }
  }

  try {
    await logIngestionEvent({
      source: "jobber",
      status: errors.length ? "partial" : "success",
      platform: "jobber",
      detail: { ingested, skipped, errors },
    });
  } catch {}

  return { ingested, skipped, errors, summaries };
}

// -------------------------------------------
// Missing Env Response Helper
// -------------------------------------------
export function missingJobberEnvResponse() {
  return {
    error: "Missing Jobber OAuth environment variables",
    required: [
      "JOBBER_AUTH_URL",
      "JOBBER_CLIENT_ID",
      "JOBBER_CLIENT_SECRET",
      "JOBBER_REDIRECT_URI",
    ],
  };
}
