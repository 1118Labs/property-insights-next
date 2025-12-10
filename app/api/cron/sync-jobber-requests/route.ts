// =============================================
// TEMPORARILY DISABLED — AWAITING FINAL FUNCTIONS
// This route previously imported enrichWithRentcast,
// EnrichmentStats, and fetchJobberRequestsNormalized,
// but those functions DO NOT EXIST in the current
// Jobber requests route.
//
// Leaving those imports in place causes Next.js builds
// (and Netlify deploys) to fail.
// =============================================

export const runtime = "nodejs";

export async function GET() {
  return new Response(
    JSON.stringify({
      status: "disabled",
      reason:
        "sync-jobber-requests temporarily disabled — missing enrichment + normalized request exports.",
    }),
    { status: 200 }
  );
}
