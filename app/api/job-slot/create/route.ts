import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { buildJobSlot } from "@/lib/scheduling/jobSlotBuilder";
import { createJobSlot } from "@/lib/scheduling/jobSlotStore";
import { assertAdminAuthorized } from "@/lib/utils/auth";
import { triggerEvent } from "@/lib/notifications/engine";

const schema = z.object({
  propertyId: z.string(),
  clientId: z.string().optional(),
  serviceProfile: z.string().optional(),
  quoteId: z.string().optional(),
});

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    return jsonError((err as { status?: number })?.status ?? 401, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid job slot payload", details: parsed.error.format(), correlationId });
    }
    const slot = await buildJobSlot(parsed.data as { propertyId: string; clientId?: string; serviceProfile?: string; quoteId?: string });
    createJobSlot(slot);
    triggerEvent("job_scheduled", { slot });
    return NextResponse.json({ data: slot, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
