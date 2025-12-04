import { NextResponse } from "next/server";
import {
  ensureJobberAccessToken,
  fetchJobberClient,
} from "@/lib/jobber";
import { createCorrelationId } from "@/lib/utils/correlation";
import { isNonEmptyString } from "@/lib/utils/validation";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const clientId = url.searchParams.get("id");
  const correlationId = createCorrelationId();

  if (!isNonEmptyString(clientId)) {
    return NextResponse.json(
      {
        error: "missing_client_id",
        message: "Client ID is required.",
        correlationId,
      },
      { status: 400 }
    );
  }

  try {
    const token = await ensureJobberAccessToken();
    const client = await fetchJobberClient(token.accessToken, clientId);

    return NextResponse.json(
      {
        client,
        correlationId,
      },
      { status: 200 }
    );
  } catch (err: any) {
    console.error("Jobber client fetch error:", err);

    return NextResponse.json(
      {
        error: "jobber_client_failed",
        message: err?.message,
        correlationId,
      },
      { status: 500 }
    );
  }
}
