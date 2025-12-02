import { DailyRoute } from "@/lib/scheduling/types";

export function describeRoute(route: DailyRoute) {
  const stops = route.stops
    .map((s, i) => `Stop ${i + 1}: ${new Date(s.arrivalTime).toLocaleTimeString()} (${s.travelMinutes}m drive)`)
    .join("; ");
  return `Route for ${route.date} (${route.stops.length} stops). Drive ${route.totalDriveMinutes}m, work ${route.totalWorkMinutes}m. ${stops}`;
}
