import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.json(
      { error: "Jobber returned an error", details: error },
      { status: 400 }
    );
  }

  if (!code) {
    return NextResponse.json(
      { error: "Missing authorization code from Jobber" },
      { status: 400 }
    );
  }

  const clientId = process.env.JOBBER_CLIENT_ID;
  const clientSecret = process.env.JOBBER_CLIENT_SECRET;
  const redirectUri = process.env.JOBBER_REDIRECT_URI;
  const tokenUrl = process.env.JOBBER_TOKEN_URL;

  if (!clientId || !clientSecret || !redirectUri || !tokenUrl) {
    return NextResponse.json(
      { error: "Missing Jobber OAuth environment variables" },
      { status: 500 }
    );
  }

  try {
    const body = new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
      client_id: clientId,
      client_secret: clientSecret,
    });

    const tokenRes = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      return NextResponse.json(
        {
          error: "Jobber token endpoint returned an error",
          status: tokenRes.status,
          body: text,
        },
        { status: 500 }
      );
    }

    const tokens = await tokenRes.json();

    // For now we just return JSON so you can see & copy the tokens.
    // Later we’ll store them in a DB (Supabase) or secure store.
    return NextResponse.json({
      message: "Jobber OAuth successful",
      tokens,
    });
  } catch (err: any) {
    return NextResponse.json(
      {
        error: "Exception in Jobber OAuth handler",
        details: err?.message || String(err),
      },
      { status: 500 }
    );
  }
}
