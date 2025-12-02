import { NextResponse } from "next/server";
import { createCorrelationId } from "@/lib/utils/api";
import { listJobSlots } from "@/lib/scheduling/jobSlotStore";

export async function GET() {
  const correlationId = createCorrelationId();
  return NextResponse.json({ data: listJobSlots(), correlationId });
}
