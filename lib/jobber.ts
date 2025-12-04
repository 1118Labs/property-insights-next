export async function exchangeCodeForTokens(code: string, origin?: string) {
  if (!process.env.JOBBER_CLIENT_ID || !process.env.JOBBER_CLIENT_SECRET) {
    throw new Error("Jobber OAuth env vars are missing. Set JOBBER_CLIENT_ID and JOBBER_CLIENT_SECRET.");
  }

  // --- NEW: force correct Jobber token endpoint ---
  const TOKEN_URL =
    process.env.JOBBER_TOKEN_URL?.trim() ||
    "https://api.getjobber.com/api/oauth/access_token";

  const redirectUri = resolveJobberRedirectUri(origin);

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization:
        "Basic " +
        Buffer.from(
          process.env.JOBBER_CLIENT_ID + ":" + process.env.JOBBER_CLIENT_SECRET
        ).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
      Accept: "application/json",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  // --- NEW: raw body for error handling ---
  const raw = await res.text();

  // Jobber sometimes returns HTML error pages when misconfigured.
  let tokenData: JobberTokenResponse | null = null;
  try {
    tokenData = JSON.parse(raw);
  } catch {
    throw new Error(
      `Jobber returned non-JSON response (${res.status}). Body begins with: ${raw.slice(
        0,
        150
      )}`
    );
  }

  if (!res.ok || !tokenData.access_token) {
    throw new Error(
      `Failed to exchange OAuth code for tokens (${res.status}): ${
        tokenData.error_description || tokenData.error || JSON.stringify(tokenData)
      }`
    );
  }

  return normalizeTokenResponse(tokenData);
}
