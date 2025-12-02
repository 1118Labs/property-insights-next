import { NextResponse } from "next/server";
import { createCorrelationId, jsonError } from "@/lib/utils/api";
import { listDailyRoutes } from "@/lib/scheduling/dailyRouteStore";

function toICS(routes: any[]) {
  const lines = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//PropertyInsights//Scheduling//EN"];
  routes.forEach((route) => {
    route.stops.forEach((stop: any, idx: number) => {
      lines.push("BEGIN:VEVENT");
      lines.push(`UID:${stop.jobSlotId}@propertyinsights`);
      lines.push(`DTSTART:${stop.arrivalTime.replace(/[-:]/g, "").replace(".000Z", "Z")}`);
      lines.push(`DTEND:${stop.departureTime.replace(/[-:]/g, "").replace(".000Z", "Z")}`);
      lines.push(`SUMMARY:Job ${idx + 1}`);
      lines.push(`DESCRIPTION:Service profile: ${stop.serviceProfile || ""}`);
      lines.push("END:VEVENT");
    });
  });
  lines.push("END:VCALENDAR");
  return lines.join("\r\n");
}

export async function GET(_: Request, context: { params: Promise<{ date: string }> }) {
  const correlationId = createCorrelationId();
  try {
    const params = await context.params;
    const routes = listDailyRoutes().filter((r) => r.date === params.date);
    if (!routes.length) return jsonError(404, { errorCode: "NOT_FOUND", message: "No routes for date", correlationId });
    const body = toICS(routes);
    return new NextResponse(body, { headers: { "Content-Type": "text/calendar", "x-correlation-id": correlationId } });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
