import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // 1) Load the most recent stored tokens
    const { data: row, error: loadErr } = await supabase
      .from("jobber_tokens")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (loadErr || !row) {
      return NextResponse.json(
        {
          error: "missing_tokens",
          message: "No Jobber tokens found in jobber_tokens table.",
          details: loadErr?.message ?? null,
        },
        { status: 400 }
      );
    }

    const refresh_token: string | null = row.refresh_token;

    if (!refresh_token) {
      return NextResponse.json(
        {
          error: "missing_refresh_token",
          message:
            "Stored Jobber token row has no refresh_token. Reconnect Jobber.",
        },
        { status: 400 }
      );
    }

    // 2) Call Jobber's OAuth token endpoint to refresh
    const tokenUrl = "https://api.getjobber.com/api/oauth/token";

    const res = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token,
        client_id: process.env.JOBBER_CLIENT_ID,
        client_secret: process.env.JOBBER_CLIENT_SECRET,
      }),
    });

    const raw = await res.text();

    let json: any = null;
    try {
      json = raw ? JSON.parse(raw) : null;
    } catch {
      // Non-JSON response from Jobber (likely HTML or a text error)
      return NextResponse.json(
        {
          error: "refresh_failed",
          message: "Jobber returned a non-JSON response.",
          status: res.status,
          raw: raw.slice(0, 300), // first 300 chars so we can see WTF it is
        },
        { status: 400 }
      );
    }

    // 3) If Jobber didn’t like our request, surface their error
    if (!res.ok) {
      return NextResponse.json(
        {
          error: "refresh_failed",
          message:
            json.error_description ||
            json.error ||
            "Jobber returned an error while refreshing.",
          status: res.status,
          jobber_error: json.error ?? null,
          jobber_error_description: json.error_description ?? null,
        },
        { status: 400 }
      );
    }

    // 4) Validate we actually got new tokens
    if (!json.access_token || !json.refresh_token) {
      return NextResponse.json(
        {
          error: "refresh_failed",
          message:
            "Jobber response did not include access_token and refresh_token.",
          status: res.status,
          jobber_error: json.error ?? null,
          jobber_error_description: json.error_description ?? null,
          raw: raw.slice(0, 300),
        },
        { status: 400 }
      );
    }

    // 5) Update rotated tokens in DB
    const { error: updateErr } = await supabase
      .from("jobber_tokens")
      .update({
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + (json.expires_in ?? 3600),
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateErr) {
      return NextResponse.json(
        {
          error: "db_error",
          message: "Failed to update Jobber tokens in database.",
          details: updateErr.message,
        },
        { status: 500 }
      );
    }

    // 6) Success
    return NextResponse.json({
      success: true,
      account_id: row.jobber_account_id ?? null,
      refreshed_at: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: "server_error",
        message: String(err),
      },
      { status: 500 }
    );
  }
}
