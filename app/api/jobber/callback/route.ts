// app/api/jobber/callback/route.ts
import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase/server";

const JOBBER_TOKEN_URL = "https://api.getjobber.com/api/oauth/token";
const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "Missing OAuth code" },
        { status: 400 }
      );
    }

    // Exchange code → tokens
    const tokenRes = await fetch(JOBBER_TOKEN_URL, {
      method: "POST",
      headers: {
        Authorization:
          "Basic " +
          Buffer.from(
            process.env.JOBBER_CLIENT_ID + ":" + process.env.JOBBER_CLIENT_SECRET
          ).toString("base64"),
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: process.env.JOBBER_REDIRECT_URI!,
      }),
    });

    const tokenData = await tokenRes.json();

    if (!tokenData.access_token) {
      return NextResponse.json(
        { error: "Failed to exchange OAuth code", detail: tokenData },
        { status: 500 }
      );
    }

    // Fetch Jobber business ID
    const graphqlRes = await fetch(JOBBER_GRAPHQL_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        query: `
          query {
            viewer {
              business {
                id
              }
            }
          }
        `,
      }),
    });

    const graphqlData = await graphqlRes.json();
    const jobberAccountId = graphqlData?.data?.viewer?.business?.id || null;

    if (!jobberAccountId) {
      return NextResponse.json(
        { error: "Could not fetch Jobber account ID" },
        { status: 500 }
      );
    }

    // INSERT INTO SUPABASE (NOW WORKS)
    const insertRes = await supabase
      .from("jobber_tokens")
      .upsert({
        jobber_account_id: jobberAccountId,
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        expires_at: Date.now() + tokenData.expires_in * 1000,
      });

    if (insertRes.error) {
      console.error("SUPABASE INSERT ERROR:", insertRes.error);
      return NextResponse.json(
        { error: "Supabase insert failed", detail: insertRes.error },
        { status: 500 }
      );
    }

    return NextResponse.redirect(
      process.env.NEXT_PUBLIC_APP_URL + "/admin/property-test"
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Server error", detail: err },
      { status: 500 }
    );
  }
}
