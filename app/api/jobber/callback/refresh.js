// /api/jobber/refresh.js
import fetch from 'node-fetch';

export default async function handler(req, res) {
  try {
    const clientId = "9301e193-4b56-48ef-bc86-ba04e64067cf";
    const clientSecret = process.env.JOBBER_CLIENT_SECRET;

    // TODO: Load the stored refresh token
    const storedRefreshToken = "REPLACE_WITH_YOUR_SAVED_REFRESH_TOKEN";

    const response = await fetch("https://api.getjobber.com/api/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: storedRefreshToken,
        client_id: clientId,
        client_secret: clientSecret
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Jobber refresh failed", data);
      return res.status(500).json({ error: "Refresh failed", details: data });
    }

    // TODO: Save new access_token & refresh_token

    return res.status(200).json({
      message: "Token refreshed",
      data
    });

  } catch (err) {
    console.error("Refresh error", err);
    return res.status(500).json({ error: err.message });
  }
}
