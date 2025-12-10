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

export async function getCurrentUserFromRequest(req: Request): Promise<CurrentUser> {
  if (!isAuthEnabled()) {
    return { email: "dev@local", role: "owner" };
  }
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!match) return null;
  const raw = decodeURIComponent(match.split("=").slice(1).join("="));
  return parseSessionCookie(raw);
}

export async function getCurrentUserFromHeaders(): Promise<CurrentUser> {
  if (!isAuthEnabled()) {
    return { email: "dev@local", role: "owner" };
  }
  const raw = cookies().get(COOKIE_NAME)?.value;
  return parseSessionCookie(raw ?? null);
}
