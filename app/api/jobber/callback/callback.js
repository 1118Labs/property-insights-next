// /api/jobber/callback.js
// Full OAuth callback handler for Jobber (ready for Netlify or Vercel)

import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const { code, state } = req.query;

    if (!code) {
      return res.status(400).json({ error: 'Missing authorization code' });
    }

    // Your app credentials
    const clientId = "9301e193-4b56-48ef-bc86-ba04e64067cf";
    const clientSecret = process.env.JOBBER_CLIENT_SECRET; // store in env variable

    // Exchange the authorization code for tokens
    const tokenResponse = await fetch("https://api.getjobber.com/api/oauth/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        redirect_uri: "https://property-insights-app.netlify.app/api/jobber/callback",
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token exchange failed", tokenData);
      return res.status(500).json({ error: "Token exchange failed", details: tokenData });
    }

    // Example tokenData payload:
    // {
    //   "access_token": "...",
    //   "token_type": "bearer",
    //   "expires_in": 3600,
    //   "refresh_token": "...",
    //   "scope": "clients.read clients.write"
    // }

    // TODO: Store tokens in your database
    // This could be Supabase, Redis, DynamoDB, MongoDB, etc.
    // Example placeholder:
    // await saveTokensToDatabase(tokenData);

    console.log("Jobber tokens acquired:", tokenData);

    // Redirect user to your admin/test page
    return res.redirect("/admin/property-test");

  } catch (err) {
    console.error("Jobber callback error:", err);
    return res.status(500).json({ error: "Server error", details: err.message });
  }
}
