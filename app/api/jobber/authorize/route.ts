// app/api/jobber/authorize/route.ts
import { NextResponse } from "next/server";

const SCOPES = ["clients.read", "properties.read", "jobs.read", "requests.read"];

export async function GET() {
  const clientId = process.env.JOBBER_CLIENT_ID;
  const redirectUri = process.env.JOBBER_REDIRECT_URI;
  const authUrl = process.env.JOBBER_AUTH_URL;

  if (!clientId || !redirectUri) {
    return NextResponse.json(
      {
        error: "config_error",
        message: "Missing JOBBER_CLIENT_ID or JOBBER_REDIRECT_URI",
      },
      { status: 500 }
    );
  }

  const url = new URL(authUrl || "https://api.getjobber.com/api/oauth/authorize");
  url.searchParams.set("response_type", "code");
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("scope", SCOPES.join(" "));

  return NextResponse.redirect(url.toString());
}
