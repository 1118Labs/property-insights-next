import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const JOBBER_TOKEN_URL = "https://api.getjobber.com/api/oauth/token";
const JOBBER_GRAPHQL_URL = "https://api.getjobber.com/api/graphql";

function makeCorrelationId() {
  return (
    "jobber-oauth-" +
    Date.now().toString(36) +
    "-" +
    Math.random().toString(36).slice(2, 8)
  );
}

function safeJsonParse(text: string): any | null {
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

export async function GET(req: Request) {
  const correlationId = makeCorrelationId();

  try {
    const url = new URL(req.url);
    const code = url.searchParams.get("code");

    if (!code) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Missing OAuth code",
          correlationId,
        },
        { status: 400 }
      );
    }

    const clientId = process.env.JOBBER_CLIENT_ID;
    const clientSecret = process.env.JOBBER_CLIENT_SECRET;
    const redirectUri = process.env.JOBBER_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      console.error("[jobber_oauth_config_error]", {
        correlationId,
        hasClientId: Boolean(clientId),
        hasClientSecret: Boolean(clientSecret),
        hasRedirectUri: Boolean(redirectUri),
      });

      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Jobber OAuth is not configured",
          correlationId,
        },
        { status: 500 }
      );
    }

    // --- 1) Exchange code for tokens (form-encoded, per OAuth spec) ---
    const tokenBody = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
    });

    const tokenRes = await fetch(JOBBER_TOKEN_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: tokenBody.toString(),
    });

    const tokenText = await tokenRes.text();
    const tokenJson = safeJsonParse(tokenText);

    console.log("[jobber_oauth_token_response]", {
      correlationId,
      ok: tokenRes.ok,
      status: tokenRes.status,
      contentType: tokenRes.headers.get("content-type"),
      hasJson: Boolean(tokenJson),
      hasAccessToken: Boolean(tokenJson && tokenJson.access_token),
      error: tokenJson && (tokenJson.error_description || tokenJson.error),
      snippet: tokenText.slice(0, 200),
    });

    if (!tokenRes.ok || !tokenJson) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message:
            (tokenJson &&
              (tokenJson.error_description || tokenJson.error)) ||
            "Token exchange failed",
          details: tokenText.slice(0, 500),
          status: tokenRes.status,
          correlationId,
        },
        { status: 400 }
      );
    }

    const access_token = tokenJson.access_token as string | undefined;
    const refresh_token =
      (tokenJson.refresh_token as string | null | undefined) ?? null;
    const expires_in =
      typeof tokenJson.expires_in === "number" ? tokenJson.expires_in : 3600;
    const expires_at = Math.floor(Date.now() / 1000) + expires_in;

    if (!access_token) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "No access_token returned from Jobber",
          correlationId,
        },
        { status: 400 }
      );
    }

    // --- 2) Fetch Jobber account id via GraphQL ---
    const graphRes = await fetch(JOBBER_GRAPHQL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${access_token}`,
        "X-JOBBER-GRAPHQL-VERSION":
          process.env.JOBBER_GRAPHQL_VERSION || "2023-11-15",
      },
      body: JSON.stringify({
        query: "query WhoAmI { account { id } user { id } }",
        operationName: "WhoAmI",
        variables: {},
      }),
    });

    const graphText = await graphRes.text();
    const graphJson = safeJsonParse(graphText);

    console.log("[jobber_oauth_graphql_response]", {
      correlationId,
      ok: graphRes.ok,
      status: graphRes.status,
      hasJson: Boolean(graphJson),
      hasErrors: Boolean(graphJson && graphJson.errors),
      snippet: graphText.slice(0, 200),
    });

    if (!graphRes.ok || !graphJson || graphJson.errors) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Error from Jobber GraphQL user/account query",
          details: graphJson?.errors || graphJson || graphText.slice(0, 500),
          correlationId,
        },
        { status: 400 }
      );
    }

    const jobber_account_id = graphJson?.data?.account?.id ?? null;

    if (!jobber_account_id) {
      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Jobber account id missing from GraphQL response",
          correlationId,
        },
        { status: 400 }
      );
    }

    // --- 3) Store tokens in Supabase ---
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      console.error("[jobber_oauth_supabase_config_error]", {
        correlationId,
        hasUrl: Boolean(supabaseUrl),
        hasKey: Boolean(supabaseServiceKey),
      });

      return NextResponse.json(
        {
          error: "callback_failed",
          message: "Supabase environment variables are not configured",
          correlationId,
        },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: { persistSession: false },
    });

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
      console.error("[jobber_oauth_supabase_upsert_error]", {
        correlationId,
        message: error.message,
      });

      return NextResponse.json(
        {
          error: "callback_failed",
          message: error.message,
          correlationId,
        },
        { status: 400 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";

    console.log("[jobber_oauth_success]", {
      correlationId,
      jobber_account_id,
    });

    return NextResponse.redirect(
      `${appUrl}/dashboard/jobber?connected=1&account=${encodeURIComponent(
        jobber_account_id
      )}&cid=${encodeURIComponent(correlationId)}`
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unexpected error";

    console.error("[jobber_oauth_unhandled_error]", {
      correlationId,
      message,
    });

    return NextResponse.json(
      { error: "callback_failed", message, correlationId },
      { status: 500 }
    );
  }
}
