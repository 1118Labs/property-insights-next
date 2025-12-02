import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { getQuote } from "@/lib/quotes/store";
import { renderQuoteHTML } from "@/lib/quotes/templates/base";

export async function GET(req: Request, context: { params: Promise<{ id: string }> }) {
  const correlationId = createCorrelationId();
  try {
    const params = await context.params;
    const url = new URL(req.url);
    const version = url.searchParams.get("version");
    const quote = getQuote(params.id, version ? Number(version) : undefined);
    if (!quote) return jsonError(404, { errorCode: "NOT_FOUND", message: "Quote not found", correlationId });
    const html = renderQuoteHTML(quote);
    return new NextResponse(html, { headers: { "Content-Type": "text/html", "x-correlation-id": correlationId } });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
