import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  const { data, error } = await supabase
    .from("jobber_tokens")
    .select("jobber_account_id, updated_at")
    .limit(1)
    .maybeSingle();

  if (error) {
    return NextResponse.json(
      { connected: false, error: error.message },
      { status: 500 }
    );
  }

  if (!data) {
    return NextResponse.json({ connected: false });
  }

  return NextResponse.json({
    connected: true,
    account_id: data.jobber_account_id,
    last_updated: data.updated_at,
  });
}
