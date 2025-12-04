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

    // Exchange code for tokens via Jobber
    const tokenRes = await fetch("https://api.getjobber.com/api/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://property-insights-app.netlify.app/api/jobber/callback",
        client_id: process.env.JOBBER_CLIENT_ID,
        client_secret: process.env.JOBBER_CLIENT_SECRET,
      }),
    });

    const tokenJson = await tokenRes.json();

    if (!tokenRes.ok) {
      return NextResponse.json(
        { error: "callback_failed", message: tokenJson },
        { status: 500 }
      );
    }

    // 🔥 Correct Jobber fields:
    const access_token = tokenJson.access_token;
    const refresh_token = tokenJson.refresh_token;
    const expires_in = tokenJson.expires_in;

    // 🔥 FIX: Jobber returns account_id, not jobber_account_id
    const jobber_account_id = tokenJson.account_id;

    if (!jobber_account_id) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Jobber returned no account_id. Cannot store tokens.",
        },
        { status: 500 }
      );
    }

    const expires_at = Math.floor(Date.now() / 1000) + expires_in;

    // Save to Supabase
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
      {
        onConflict: "jobber_account_id",
      }
    );

    if (error) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: error.message,
        },
        { status: 500 }
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
