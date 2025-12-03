import { NextResponse } from "next/server";

export const isSupabaseConfigured = Boolean(
  process.env.NEXT_PUBLIC_SUPABASE_URL &&
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY &&
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export const isJobberConfigured = Boolean(
  process.env.JOBBER_CLIENT_ID &&
  process.env.JOBBER_CLIENT_SECRET &&
  // Allow deriving redirect URI from app URL when explicit env is missing
  (process.env.JOBBER_REDIRECT_URI || process.env.NEXT_PUBLIC_APP_URL || process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.VERCEL_URL)
);

export const isSafeMode = process.env.SAFE_MODE === "true";
export const isDemoMode = process.env.NEXT_PUBLIC_DEMO_MODE === "true";
export const isAnalyticsEnabled = process.env.ANALYTICS_ENABLED === "true";

export function assertNotSafeMode() {
  if (isSafeMode) {
    throw new Error("SAFE_MODE enabled; operation blocked");
  }
}

export function assertSupabaseConfigured() {
  if (!isSupabaseConfigured) {
    throw new Error("Supabase is not configured. Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.");
  }
}

export function assertJobberConfigured() {
  if (!isJobberConfigured) {
    throw new Error("Jobber OAuth env vars are missing. Set JOBBER_CLIENT_ID, JOBBER_CLIENT_SECRET, and JOBBER_REDIRECT_URI (or NEXT_PUBLIC_APP_URL to derive it) plus JOBBER_AUTH_URL.");
  }
}

export function missingEnvResponse(keys: string[]) {
  return NextResponse.json(
    {
      error: "Missing required environment variables",
      missing: keys,
    },
    { status: 500 }
  );
}
