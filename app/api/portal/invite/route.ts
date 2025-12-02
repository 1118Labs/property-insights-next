import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { createInvite } from "@/lib/portal/store";
import { portalDisabled } from "@/lib/portal/config";
import { assertAdminAuthorized } from "@/lib/utils/auth";

const schema = z.object({
  clientId: z.string(),
  propertyId: z.string(),
  quoteId: z.string().optional(),
});

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  if (portalDisabled) {
    return jsonError(403, { errorCode: "PORTAL_DISABLED", message: "Client portal is disabled", correlationId });
  }
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    return jsonError((err as { status?: number })?.status ?? 401, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid invite payload", details: parsed.error.format(), correlationId });
    }
    const invite = createInvite(parsed.data as { clientId: string; propertyId: string; quoteId?: string });
    return NextResponse.json({ data: invite, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
