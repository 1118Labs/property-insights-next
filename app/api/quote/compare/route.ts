import { NextResponse } from "next/server";
import { z } from "zod";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { getQuote } from "@/lib/quotes/store";
import { compareQuotes } from "@/lib/quotes/builder";

const schema = z.object({
  leftId: z.string(),
  rightId: z.string(),
});

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const body = await req.json().catch(() => ({}));
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "leftId and rightId required", details: parsed.error.format(), correlationId });
    }
    const left = getQuote(parsed.data.leftId);
    const right = getQuote(parsed.data.rightId);
    if (!left || !right) return jsonError(404, { errorCode: "NOT_FOUND", message: "Quote missing", correlationId });
    return NextResponse.json({ data: compareQuotes(left, right), correlationId });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
