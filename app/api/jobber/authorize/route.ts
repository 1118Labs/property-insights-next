import { NextResponse } from "next/server";

export async function GET() {
  const authBase = process.env.JOBBER_AUTH_URL;
  const clientId = process.env.JOBBER_CLIENT_ID;
  const redirectUri = process.env.JOBBER_REDIRECT_URI;

  if (!authBase || !clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "Missing Jobber OAuth env vars",
        details: {
          JOBBER_AUTH_URL: !!authBase,
          JOBBER_CLIENT_ID: !!clientId,
          JOBBER_REDIRECT_URI: !!redirectUri,
        },
      },
      { status: 500 }
    );
  }

  const url = new URL(authBase);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");
  url.searchParams.set("scope", "offline_access");
  url.searchParams.set("state", "propertyInsightsConnect");

  return NextResponse.redirect(url.toString());
}
