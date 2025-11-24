import { NextResponse } from "next/server";

export async function GET() {
  const base = process.env.JOBBER_AUTH_URL;

  if (!base) {
    return NextResponse.json(
      {
        error: "Missing Jobber OAuth env vars",
        details: {
          JOBBER_AUTH_URL: !!process.env.JOBBER_AUTH_URL,
          JOBBER_CLIENT_ID: !!process.env.JOBBER_CLIENT_ID,
          JOBBER_REDIRECT_URI: !!process.env.JOBBER_REDIRECT_URI,
        },
      },
      { status: 500 }
    );
  }

  const authUrl = new URL(base);
  authUrl.searchParams.set("client_id", process.env.JOBBER_CLIENT_ID!);
  authUrl.searchParams.set("redirect_uri", process.env.JOBBER_REDIRECT_URI!);
  authUrl.searchParams.set("response_type", "code");
  authUrl.searchParams.set("scope", "read write");

  return NextResponse.redirect(authUrl.toString());
}
