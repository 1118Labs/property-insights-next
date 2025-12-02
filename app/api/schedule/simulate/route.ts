import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { simulateRoutes } from "@/lib/scheduling/simulator";

const schema = z.object({ slotIds: z.array(z.string()).optional() });

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid payload", details: parsed.error.format(), correlationId });
    }
    const routes = simulateRoutes(parsed.data.slotIds);
    return NextResponse.json({ data: routes, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
