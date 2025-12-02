import { DailyRoute } from "@/lib/scheduling/types";

const routes = new Map<string, DailyRoute>();

export function saveDailyRoute(route: DailyRoute) {
  routes.set(`${route.date}:${route.technicianId || "default"}`, route);
  return route;
}

export function listDailyRoutes() {
  return Array.from(routes.values());
}

export function getDailyRoute(key: string) {
  return routes.get(key) || null;
}
