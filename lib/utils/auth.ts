import { adminSecretHeaderSchema } from "@/lib/utils/validationSchema";

export function assertAdminAuthorized(req: Request) {
  const expected = process.env.ADMIN_SHARED_SECRET;
  if (!expected) {
    // No secret configured; rely on outer auth (comment for ops).
    return;
  }
  const provided = req.headers.get("x-admin-secret") || "";
  const parsed = adminSecretHeaderSchema.safeParse(provided);
  if (!parsed.success || parsed.data !== expected) {
    const err = new Error("Unauthorized") as Error & { status?: number };
    err.status = 401;
    throw err;
  }
}
