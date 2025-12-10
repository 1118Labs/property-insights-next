import { createClient } from "@supabase/supabase-js";
import { logError } from "./logging";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

type AccountRow = {
  id: string;
  jobber_account_id: string | null;
  name: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export async function getAccountByJobberAccountId(
  jobberAccountId: string
): Promise<AccountRow | null> {
  if (!jobberAccountId) return null;
  try {
    const { data, error } = await supabase
      .from("accounts")
      .select("*")
      .eq("jobber_account_id", jobberAccountId)
      .maybeSingle<AccountRow>();

    if (error) {
      logError("accounts.get", "Failed to fetch account", { error });
      return null;
    }

    if (data) return data;

    const { data: inserted, error: insertError } = await supabase
      .from("accounts")
      .insert({ jobber_account_id: jobberAccountId, name: null })
      .select()
      .single<AccountRow>();

    if (insertError) {
      logError("accounts.create", "Failed to create account", { error: insertError });
      return null;
    }

    return inserted;
  } catch (err) {
    logError("accounts.get", "Unexpected error", { err });
    return null;
  }
}

function currentMonthWindow() {
  const start = new Date();
  start.setUTCDate(1);
  start.setUTCHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setUTCMonth(end.getUTCMonth() + 1);
  end.setUTCDate(0);
  end.setUTCHours(23, 59, 59, 999);
  return { start: start.toISOString(), end: end.toISOString() };
}

export async function incrementUsage(
  accountId: string,
  metric: "requests_synced" | "quotes_generated" | "properties_enriched",
  amount: number
) {
  if (!accountId) return;
  const { start, end } = currentMonthWindow();

  try {
    const { data, error } = await supabase
      .from("usage_metrics")
      .select("*")
      .eq("account_id", accountId)
      .eq("metric", metric)
      .eq("period_start", start)
      .eq("period_end", end)
      .maybeSingle<{ id: string; value: number }>();

    if (error && error.code !== "PGRST116") {
      logError("usage.increment", "Failed to read usage row", { error });
      return;
    }

    if (data) {
      const nextValue = Number(data.value ?? 0) + amount;
      const { error: updateError } = await supabase
        .from("usage_metrics")
        .update({ value: nextValue })
        .eq("id", data.id);
      if (updateError) {
        logError("usage.increment", "Failed to update usage", { error: updateError });
      }
      return;
    }

    const { error: insertError } = await supabase.from("usage_metrics").insert({
      account_id: accountId,
      metric,
      value: amount,
      period_start: start,
      period_end: end,
    });
    if (insertError) {
      logError("usage.increment", "Failed to insert usage", { error: insertError });
    }
  } catch (err) {
    logError("usage.increment", "Unexpected error", { err });
  }
}
