import { NextResponse } from "next/server";
import { fetchRecentJobberRequests } from "@/lib/jobber";
import { getAnyJobberAccessToken } from "@/lib/jobberTokens";
import { logError, logInfo } from "@/lib/logging";

function sanitizeRequestNode(edge: any) {
  const node = edge?.node ?? {};
  const client = node.client ?? {};
  const property = node.property ?? {};
  const address = property.address ?? {};

  return {
    id: node.id ?? null,
    status: node.status ?? null,
    title: node.title ?? null,
    createdAt: node.createdAt ?? null,
    client: {
      id: client.id ?? null,
      name: [client.firstName, client.lastName].filter(Boolean).join(" ") || null,
      email: client.email ?? null,
      phone: client.phone ?? null,
    },
    address: {
      line1: address.line1 ?? address.street ?? null,
      line2: address.line2 ?? null,
      city: address.city ?? null,
      province: address.province ?? null,
      postalCode: address.postalCode ?? null,
      country: address.country ?? null,
    },
  };
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
    const edges = await fetchRecentJobberRequests(token.accessToken, 1);
    const sample = edges[0] ? sanitizeRequestNode(edges[0]) : null;

    logInfo("jobber_dev_ping", "Jobber dev ping success", {
      jobberAccountId: token.jobberAccountId,
      sampleRequestId: sample?.id ?? null,
    });

    return NextResponse.json({
      ok: true,
      data: {
        jobberAccountId: token.jobberAccountId,
        sampleRequest: sample,
        totalFetched: edges.length,
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
