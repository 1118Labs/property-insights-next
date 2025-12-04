import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        { error: "callback_failed", message: "Missing OAuth code" },
        { status: 400 }
      );
    }

    //
    // STEP 1 — Exchange code for access + refresh tokens
    //
    const tokenRes = await fetch("https://api.getjobber.com/api/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        client_id: process.env.JOBBER_CLIENT_ID,
        client_secret: process.env.JOBBER_CLIENT_SECRET,
        redirect_uri:
          "https://property-insights-app.netlify.app/api/jobber/callback",
      }),
    });

    const tokenText = await tokenRes.text();

    let tokenJson: any;
    try {
      tokenJson = JSON.parse(tokenText);
    } catch (e) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Token endpoint did not return JSON",
          details: tokenText.slice(0, 200),
        },
        { status: 400 }
      );
    }

    if (!tokenRes.ok) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: tokenJson.error_description || tokenJson,
        },
        { status: 400 }
      );
    }

    const access_token = tokenJson.access_token;
    const refresh_token = tokenJson.refresh_token;
    const expires_in = tokenJson.expires_in || 3600;
    const expires_at = Math.floor(Date.now() / 1000) + expires_in;

    if (!access_token) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "No access_token returned from Jobber",
        },
        { status: 400 }
      );
    }

    //
    // STEP 2 — Use GraphQL to get account + user IDs
    //
    const graphRes = await fetch("https://api.getjobber.com/api/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        "X-JOBBER-GRAPHQL-VERSION":
          process.env.JOBBER_GRAPHQL_VERSION || "2023-11-15",
      },
      body: JSON.stringify({
        query: `
          query WhoAmI {
            account {
              id
            }
            user {
              id
            }
          }
        `,
        operationName: "WhoAmI",
      }),
    });

    const graphText = await graphRes.text();

    let graphJson: any;
    try {
      graphJson = JSON.parse(graphText);
    } catch (e) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "GraphQL endpoint did not return JSON",
          details: graphText.slice(0, 200),
        },
        { status: 400 }
      );
    }

    if (!graphRes.ok || graphJson.errors) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Error from Jobber GraphQL user/account query",
          details: graphJson.errors || graphJson,
        },
        { status: 400 }
      );
    }

    const jobber_account_id = graphJson?.data?.account?.id || null;
    const jobber_user_id = graphJson?.data?.user?.id || null;

    if (!jobber_account_id) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message:
            "Jobber GraphQL response did not include account.id. Cannot store tokens.",
          details: graphJson.data,
        },
        { status: 400 }
      );
    }

    //
    // STEP 3 — Store tokens + account_id in Supabase
    //
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("jobber_tokens").upsert(
      {
        jobber_account_id,
        access_token,
        refresh_token,
        expires_at,
      },
      { onConflict: "jobber_account_id" }
    );

    if (error) {
      return NextResponse.json(
        { error: "callback_failed", message: error.message },
        { status: 400 }
      );
    }

    //
    // FINAL STEP — Redirect to UI page instead of returning JSON
    //
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_APP_URL}/jobber/connected?account=${jobber_account_id}`
    );
  } catch (err: any) {
    return NextResponse.json(
      { error: "callback_failed", message: err.message },
      { status: 500 }
    );
  }
}
