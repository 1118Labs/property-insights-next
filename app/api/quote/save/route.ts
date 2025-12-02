import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { quoteSchema } from "@/lib/quotes/quote";
import { saveQuote } from "@/lib/quotes/store";
import { assertAdminAuthorized } from "@/lib/utils/auth";
import { randomUUID } from "crypto";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    assertAdminAuthorized(req);
  } catch (err) {
    return jsonError((err as { status?: number })?.status ?? 401, { errorCode: "UNAUTHORIZED", message: "Admin secret required", correlationId });
  }
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = quoteSchema.partial().safeParse(body.quote || body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "Invalid quote payload", details: parsed.error.format(), correlationId });
    }
    const saved = saveQuote({ ...parsed.data, id: parsed.data.id || randomUUID(), version: parsed.data.version || 0, createdAt: parsed.data.createdAt || new Date().toISOString() } as any);
    return NextResponse.json({ data: saved, correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
