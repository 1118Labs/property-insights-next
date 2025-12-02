import { basicRoute } from "@/lib/scheduling/routeOptimizer";
import { listJobSlots } from "@/lib/scheduling/jobSlotStore";
import { DailyRoute } from "@/lib/scheduling/types";

export function simulateRoutes(slotIds?: string[]): DailyRoute[] {
  const slots = listJobSlots().filter((s) => !slotIds || slotIds.includes(s.id));
  const locations: Record<string, { lat: number; lon: number }> = {};
  slots.forEach((s) => {
    locations[s.propertyId] = locations[s.propertyId] || { lat: 40, lon: -73 };
  });
  return basicRoute(slots, locations, "travel_minimized");
}
