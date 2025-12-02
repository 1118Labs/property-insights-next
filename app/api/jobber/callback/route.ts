import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type JobberTokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json({ error: "Jobber OAuth error", details: error }, { status: 400 });
  }
  if (!code) {
    return NextResponse.json({ error: "Missing authorization code" }, { status: 400 });
  }

  const clientId = process.env.JOBBER_CLIENT_ID;
  const clientSecret = process.env.JOBBER_CLIENT_SECRET;
  const redirectUri = process.env.JOBBER_REDIRECT_URI;
  const tokenUrl = process.env.JOBBER_TOKEN_URL;
  if (!clientId || !clientSecret || !redirectUri || !tokenUrl) {
    return NextResponse.json({ error: "Jobber OAuth env vars missing" }, { status: 500 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRoleKey) {
    return NextResponse.json({ error: "Supabase env vars missing" }, { status: 500 });
  }

  const basic = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const tokenRes = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!tokenRes.ok) {
    const text = await tokenRes.text();
    return NextResponse.json({ error: "Failed to exchange code", details: text }, { status: 500 });
  }

  const tokenJson = (await tokenRes.json()) as JobberTokenResponse;
  if (!tokenJson.access_token || !tokenJson.refresh_token) {
    return NextResponse.json({ error: "Invalid token response" }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const jobberAccountId = "default-account";
  const expiresAt = new Date(Date.now() + (tokenJson.expires_in || 0) * 1000).toISOString();

  const { error: upsertError } = await supabase.from("jobber_credentials").upsert(
    {
      jobber_account_id: jobberAccountId,
      access_token: tokenJson.access_token,
      refresh_token: tokenJson.refresh_token,
      expires_at: expiresAt,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "jobber_account_id" }
  );

  if (upsertError) {
    return NextResponse.json({ error: "Failed to store tokens", details: upsertError.message }, { status: 500 });
  }

  const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return NextResponse.redirect(new URL("/connected", base));
}
