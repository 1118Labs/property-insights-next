import { cookies } from "next/headers";
import { isAuthEnabled } from "./featureFlags";

export type CurrentUser = {
  email: string;
  role: "owner" | "viewer";
  accountId?: string;
} | null;

const COOKIE_NAME = "pi_dev_session";

function parseSessionCookie(raw: string | undefined | null): CurrentUser {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed.email === "string" && parsed.role) {
      return {
        email: parsed.email,
        role: parsed.role === "owner" ? "owner" : "viewer",
        accountId: parsed.accountId,
      };
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * DEPRECATED — now just proxies to getCurrentUserFromHeaders()
 * because server components should rely on Next.js cookies().
 */
export async function getCurrentUserFromRequest(_: Request): Promise<CurrentUser> {
  return getCurrentUserFromHeaders();
}

/**
 * Primary authentication helper for all server components.
 * Reads the cookie directly from the Next.js headers() API.
 */
export async function getCurrentUserFromHeaders(): Promise<CurrentUser> {
  if (!isAuthEnabled()) {
    return { email: "dev@local", role: "owner" };
  }

  const raw = cookies().get(COOKIE_NAME)?.value;
  return parseSessionCookie(raw ?? null);
}
