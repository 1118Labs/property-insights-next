import { NextResponse } from "next/server";
import { createCorrelationId } from "@/lib/utils/api";

export async function POST(req: Request) {
  const correlationId = createCorrelationId();
  const body = await req.json().catch(() => ({}));
  return NextResponse.json({ received: body, correlationId });
}
