// app/api/jobber/auth/route.ts

import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.JOBBER_CLIENT_ID;
  const redirectUri = process.env.JOBBER_REDIRECT_URI;
  const authUrl = process.env.JOBBER_AUTH_URL;

  if (!clientId || !redirectUri || !authUrl) {
    return NextResponse.json(
      { error: "Missing Jobber OAuth environment variables" },
      { status: 500 }
    );
  }

  const url = new URL(authUrl);
  url.searchParams.set("client_id", clientId);
  url.searchParams.set("redirect_uri", redirectUri);
  url.searchParams.set("response_type", "code");

  return NextResponse.redirect(url.toString());
}
