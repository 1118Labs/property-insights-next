import { NextResponse } from "next/server";
import { JOBBER_GRAPHQL_API_VERSION } from "@/lib/jobber";
import { getAnyJobberAccessToken } from "@/lib/jobberTokens";
import { logError, logInfo } from "@/lib/logging";

const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";

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

export async function GET() {
  const token = await getAnyJobberAccessToken();

  if (!token) {
    return NextResponse.json(
      {
        ok: false,
        error: {
          code: "missing_token",
          message: "No Jobber access token is available. Connect Jobber first.",
          status: 401,
        },
      },
      { status: 401 }
    );
  }

  try {
    const query = `
      query GetRequests {
        requests(first: 50) {
          nodes {
            id
            title
            contactName
            email
            phone
            createdAt
            updatedAt
            requestStatus
            companyName
            source
            jobberWebUri
            client {
              id
              name
            }
            property {
              id
              address
            }
          }
        }
      }
    `;

    const res = await fetch(JOBBER_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.accessToken}`,
        "X-Jobber-Graphql-Version": JOBBER_GRAPHQL_API_VERSION,
      },
      body: JSON.stringify({ query, operationName: "GetRequests" }),
    });

    const raw = await res.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch {
      const error = new Error(formatJobberGraphqlError(res.status, raw));
      (error as any).status = res.status;
      throw error;
    }

    if (!res.ok || json?.errors) {
      const error = new Error(formatJobberGraphqlError(res.status, raw));
      (error as any).status = res.status;
      throw error;
    }

    const nodes = json?.data?.requests?.nodes ?? [];

    const sample = nodes[0]
      ? {
          id: nodes[0]?.id ?? null,
          title: nodes[0]?.title ?? null,
          contactName: nodes[0]?.contactName ?? nodes[0]?.client?.name ?? null,
          email: nodes[0]?.email ?? null,
          phone: nodes[0]?.phone ?? null,
          createdAt: nodes[0]?.createdAt ?? null,
          requestStatus: nodes[0]?.requestStatus ?? null,
          propertyAddress: nodes[0]?.property?.address ?? null,
        }
      : null;

    logInfo("jobber_dev_ping", "Jobber dev ping success", {
      jobberAccountId: token.jobberAccountId,
      sampleRequestId: sample?.id ?? null,
    });

    return NextResponse.json({
      ok: true,
      data: {
        jobberAccountId: token.jobberAccountId,
        sampleRequest: sample,
        totalFetched: nodes.length,
      },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Jobber dev ping failed.";
    const status = (err as any)?.status ?? 500;
    logError("jobber_dev_ping", "Jobber dev ping error", {
      message,
      status,
    });

    return NextResponse.json(
      {
        ok: false,
        error: {
          message,
          status,
        },
      },
      { status: typeof status === "number" ? status : 500 }
    );
  }
}
