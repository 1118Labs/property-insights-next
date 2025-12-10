import { createClient } from "@supabase/supabase-js";

export type JobberTokenRow = {
  jobber_account_id: string;
  access_token: string;
  refresh_token: string | null;
  expires_at: number | null; // unix seconds
};

type JobberTokenResponse = {
  access_token?: string;
  refresh_token?: string | null;
  expires_in?: number;
  error?: string;
  error_description?: string;
};

type GetJobberTokenOpts = {
  jobber_account_id?: string;
  requireValid?: boolean;
};

type GetJobberTokenResult = {
  token: JobberTokenRow | null;
  reason?: "missing_token" | "refresh_failed" | "supabase_error" | "config_error";
  error?: string;
};

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Supabase environment variables are not configured for Jobber tokens");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false },
});

const JOBBER_TOKEN_URL =
  process.env.JOBBER_TOKEN_URL || "https://api.getjobber.com/api/oauth/token";

function normalizeRow(row: JobberTokenRow): JobberTokenRow {
  return {
    jobber_account_id: row.jobber_account_id,
    access_token: row.access_token,
    refresh_token: row.refresh_token ?? null,
    expires_at:
      typeof row.expires_at === "number"
        ? row.expires_at
        : row.expires_at
        ? Number(row.expires_at)
        : null,
  };
}

function needsRefresh(expiresAt: number | null): boolean {
  const now = Math.floor(Date.now() / 1000);
  if (expiresAt === null) return true;
  return expiresAt <= now + 300;
}

async function refreshJobberToken(
  row: JobberTokenRow
): Promise<JobberTokenRow | null> {
  if (!row.refresh_token) return null;

  const clientId = process.env.JOBBER_CLIENT_ID;
  const clientSecret = process.env.JOBBER_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    console.warn("Jobber token refresh skipped: missing client credentials");
    return null;
  }

  const res = await fetch(JOBBER_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      grant_type: "refresh_token",
      refresh_token: row.refresh_token,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const text = await res.text();

  let json: JobberTokenResponse;
  try {
    json = JSON.parse(text) as JobberTokenResponse;
  } catch {
    console.warn("Jobber token refresh parse failed", { status: res.status });
    return null;
  }

  if (!res.ok || !json.access_token) {
    console.warn("Jobber token refresh failed", {
      status: res.status,
      error: json.error || json.error_description,
    });
    return null;
  }

  const expiresIn = typeof json.expires_in === "number" ? json.expires_in : 3600;
  const updatedRow: JobberTokenRow = {
    jobber_account_id: row.jobber_account_id,
    access_token: json.access_token,
    refresh_token: json.refresh_token ?? row.refresh_token,
    expires_at: Math.floor(Date.now() / 1000) + expiresIn,
  };

  const { error } = await supabase
    .from("jobber_tokens")
    .upsert(updatedRow, { onConflict: "jobber_account_id" });

  if (error) {
    console.warn("Failed to store refreshed Jobber token", {
      message: error.message,
    });
    return null;
  }

  return updatedRow;
}

export async function getJobberToken(
  opts: GetJobberTokenOpts = {}
): Promise<GetJobberTokenResult> {
  const { jobber_account_id, requireValid } = opts;

  let query = supabase.from("jobber_tokens").select("*").limit(1);
  if (jobber_account_id) {
    query = query.eq("jobber_account_id", jobber_account_id);
  }

  const { data, error } = await query.maybeSingle<JobberTokenRow>();

  if (error) {
    console.warn("Jobber token lookup failed", { message: error.message });
    return { token: null, reason: "supabase_error", error: error.message };
  }

  if (!data) {
    return { token: null, reason: "missing_token" };
  }

  let token = normalizeRow(data);

  if (requireValid && needsRefresh(token.expires_at)) {
    const refreshed = await refreshJobberToken(token);
    if (!refreshed) {
      return { token: null, reason: "refresh_failed" };
    }
    token = refreshed;
  }

  return { token };
}

export async function getJobberAccessTokenForAccount(
  jobberAccountId: string
): Promise<{ accessToken: string } | null> {
  const { token } = await getJobberToken({
    jobber_account_id: jobberAccountId,
    requireValid: true,
  });

  if (!token) return null;

  return { accessToken: token.access_token };
}

export async function getAnyJobberAccessToken(): Promise<{
  accessToken: string;
  jobberAccountId: string;
} | null> {
  const { token } = await getJobberToken({ requireValid: true });

  if (!token) return null;

  return {
    accessToken: token.access_token,
    jobberAccountId: token.jobber_account_id,
  };
}
