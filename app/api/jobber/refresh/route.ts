import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Load stored tokens
    const { data: row, error: loadErr } = await supabase
      .from("jobber_tokens")
      .select("*")
      .single();

    if (loadErr || !row) {
      return NextResponse.json(
        { error: "missing_tokens", message: "No tokens found." },
        { status: 400 }
      );
    }

    const refresh_token = row.refresh_token;

    // -------------------------------
    // JOBBER REFRESH TOKEN CALL
    // MUST use x-www-form-urlencoded
    // MUST hit /oauth/access_token
    // -------------------------------
    const body = new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token,
      client_id: process.env.JOBBER_CLIENT_ID!,
      client_secret: process.env.JOBBER_CLIENT_SECRET!,
    });

    const res = await fetch(
      "https://api.getjobber.com/api/oauth/access_token",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body,
      }
    );

    const json = await res.json().catch(() => null);

    if (!res.ok || !json) {
      return NextResponse.json(
        {
          error: "refresh_failed",
          message:
            json?.error_description ||
            json?.error ||
            "Jobber returned invalid response",
        },
        { status: 400 }
      );
    }

    // Update tokens in DB
    const { error: updateErr } = await supabase
      .from("jobber_tokens")
      .update({
        access_token: json.access_token,
        refresh_token: json.refresh_token,
        expires_at: Math.floor(Date.now() / 1000) + json.expires_in,
        updated_at: new Date().toISOString(),
      })
      .eq("id", row.id);

    if (updateErr) {
      return NextResponse.json(
        { error: "db_error", message: updateErr.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      refreshed_at: new Date().toISOString(),
    });

  } catch (err) {
    return NextResponse.json(
      { error: "server_error", message: String(err) },
      { status: 500 }
    );
  }
}
