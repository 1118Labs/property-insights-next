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

    const tokenJson = await tokenRes.json();

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

    //
    // STEP 2 — Call /api/user to retrieve account_id + user_id
    //
    const userRes = await fetch("https://api.getjobber.com/api/user", {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
    });

    const userJson = await userRes.json();

    if (!userRes.ok || !userJson?.user) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Unable to fetch Jobber user profile.",
          details: userJson,
        },
        { status: 400 }
      );
    }

    const jobber_account_id = userJson.user.account_id;
    const jobber_user_id = userJson.user.id;

    if (!jobber_account_id) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message:
            "Jobber user profile did not include account_id. Cannot store tokens.",
        },
        { status: 400 }
      );
    }

    //
    // STEP 3 — Store tokens + account_id + user_id in Supabase
    //
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { error } = await supabase.from("jobber_tokens").upsert(
      {
        jobber_account_id,
        jobber_user_id,
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

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json(
      { error: "callback_failed", message: err.message },
      { status: 500 }
    );
  }
}
