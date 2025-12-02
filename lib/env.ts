import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  JOBBER_CLIENT_ID: z.string().optional(),
  JOBBER_CLIENT_SECRET: z.string().optional(),
  JOBBER_REDIRECT_URI: z.string().optional(),
});

export function validateEnv() {
  const parsed = envSchema.safeParse(process.env);
  if (!parsed.success) {
    // eslint-disable-next-line no-console
    console.warn("Env validation failed", parsed.error.format());
  }
}
