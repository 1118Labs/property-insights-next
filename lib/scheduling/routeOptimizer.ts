import { DailyRoute, JobSlot, RouteStop } from "@/lib/scheduling/types";
import { estimateTravelMinutes } from "@/lib/scheduling/geoDistance";
import { getSchedulingConfig } from "@/lib/scheduling/config";

type LocationMap = Record<string, { lat: number; lon: number }>;

function parseTime(value: string) {
  const date = new Date(value);
  return isNaN(date.getTime()) ? new Date() : date;
}

export function basicRoute(slots: JobSlot[], locations: LocationMap, mode: DailyRoute["mode"] = "travel_minimized"): DailyRoute[] {
  const cfg = getSchedulingConfig();
  const workingStart = cfg.workingHours.start;
  const workingEnd = cfg.workingHours.end;
  const maxMinutes = cfg.maxDailyMinutes;
  const avgSpeed = cfg.avgSpeedKmh;

  const remaining = [...slots];
  const routes: DailyRoute[] = [];
  let currentDate = new Date().toISOString().split("T")[0];

  while (remaining.length) {
    const dayStops: RouteStop[] = [];
    let drive = 0;
    let work = 0;
    let cursorTime = new Date(`${currentDate}T${workingStart}:00Z`);

    const startLoc = locations[remaining[0].propertyId] || { lat: 40, lon: -73 };
    let currentLoc = startLoc;

    // simple nearest neighbor heuristic
    remaining.sort((a, b) => {
      const locA = locations[a.propertyId] || startLoc;
      const locB = locations[b.propertyId] || startLoc;
      return estimateTravelMinutes(currentLoc, locA, avgSpeed) - estimateTravelMinutes(currentLoc, locB, avgSpeed);
    });

    for (const slot of [...remaining]) {
      const loc = locations[slot.propertyId] || startLoc;
      const travel = dayStops.length === 0 ? 0 : estimateTravelMinutes(currentLoc, loc, avgSpeed);
      const arrival = new Date(cursorTime.getTime() + travel * 60000);
      const depart = new Date(arrival.getTime() + slot.durationMinutes * 60000);
      const endOfDay = new Date(`${currentDate}T${workingEnd}:00Z`);

      // soft constraints: avoid Fridays, prefer morning
      const isFriday = new Date(`${currentDate}T00:00:00Z`).getUTCDay() === 5;
      if (slot.hints?.avoidFridays && isFriday) continue;
      if (slot.hints?.morningPreferred && arrival.getUTCHours() > 12) continue;

      if (depart > endOfDay || drive + travel + work + slot.durationMinutes > maxMinutes) {
        continue;
      }
      dayStops.push({
        jobSlotId: slot.id,
        arrivalTime: arrival.toISOString(),
        departureTime: depart.toISOString(),
        travelMinutes: travel,
      });
      drive += travel;
      work += slot.durationMinutes;
      cursorTime = depart;
      currentLoc = loc;
      remaining.splice(remaining.indexOf(slot), 1);
    }

    if (!dayStops.length) {
      // fallback: schedule one per day
      const slot = remaining.shift()!;
      const loc = locations[slot.propertyId] || startLoc;
      const arrival = new Date(`${currentDate}T${workingStart}:00Z`);
      const depart = new Date(arrival.getTime() + slot.durationMinutes * 60000);
      dayStops.push({ jobSlotId: slot.id, arrivalTime: arrival.toISOString(), departureTime: depart.toISOString(), travelMinutes: 0 });
      drive = 0;
      work = slot.durationMinutes;
    }

    const route: DailyRoute = {
      date: currentDate,
      stops: dayStops,
      totalDriveMinutes: drive,
      totalWorkMinutes: work,
      status: "planned",
      mode,
    };
    routes.push(route);
    // move to next day
    const nextDay = new Date(`${currentDate}T00:00:00Z`);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    currentDate = nextDay.toISOString().split("T")[0];
  }

  return routes;
}
