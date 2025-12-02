// lib/supabase/server.ts

import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured } from "../config";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const supabaseEnabled = isSupabaseConfigured;

const supabaseClient = supabaseEnabled && supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export const supabaseAdmin = supabaseEnabled && supabaseUrl && supabaseServiceRoleKey
  ? createClient(supabaseUrl, supabaseServiceRoleKey, { auth: { persistSession: false } })
  : null;

export const supabase = () => supabaseClient;

export function requireAdminClient() {
  if (!supabaseAdmin) {
    throw new Error("Supabase admin client is not configured. Provide NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY.");
  }
  return supabaseAdmin;
}
