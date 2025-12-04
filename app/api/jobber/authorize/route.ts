// app/api/jobber/authorize/route.ts
import { NextResponse } from "next/server";

export async function GET() {
  const clientId = process.env.JOBBER_CLIENT_ID!;
  const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/api/jobber/callback`;
  const scopes = "clients.read%20properties.read%20jobs.read";

  const url =
    `https://api.getjobber.com/api/oauth/authorize?response_type=code` +
    `&client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&scope=${scopes}`;

  return NextResponse.redirect(url);
}
