import { NextResponse } from "next/server";
import { createCorrelationId } from "@/lib/utils/api";
import { testCRMConnections } from "@/lib/crm/stubs";

export async function GET() {
  const correlationId = createCorrelationId();
  return NextResponse.json({ data: testCRMConnections(), correlationId });
}
