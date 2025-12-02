import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { saveDailyRoute } from "@/lib/scheduling/dailyRouteStore";
import { dailyRouteSchema } from "@/lib/scheduling/types";

const schema = z.object({ routes: z.array(dailyRouteSchema) });

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid routes payload", details: parsed.error.format(), correlationId });
    }
    const saved = parsed.data.routes.map((r) => saveDailyRoute({ ...r, status: "planned" }));
    return NextResponse.json({ data: saved, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
