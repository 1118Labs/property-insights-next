import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,   // NOT service_role, use sb_secret_
  {
    auth: {
      persistSession: false,
    }
  }
);
