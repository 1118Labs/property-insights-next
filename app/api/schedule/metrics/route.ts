import { NextResponse } from "next/server";
import { createCorrelationId } from "@/lib/utils/api";
import { listDailyRoutes } from "@/lib/scheduling/dailyRouteStore";
import { listJobSlots } from "@/lib/scheduling/jobSlotStore";

export async function GET() {
  const correlationId = createCorrelationId();
  const routes = listDailyRoutes();
  const totalScheduled = routes.reduce((acc, r) => acc + r.stops.length, 0);
  const avgTravel = routes.length ? routes.reduce((acc, r) => acc + r.totalDriveMinutes, 0) / routes.length : 0;
  const avgWork = routes.length ? routes.reduce((acc, r) => acc + r.totalWorkMinutes, 0) / routes.length : 0;
  return NextResponse.json(
    {
      data: {
        totalScheduled,
        avgTravelMinutes: Math.round(avgTravel),
        avgWorkMinutes: Math.round(avgWork),
        pendingJobSlots: listJobSlots().length,
      },
      correlationId,
    }
  );
}
