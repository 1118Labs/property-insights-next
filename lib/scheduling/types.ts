import { z } from "zod";
import { ServiceProfileType } from "@/lib/types";

export const timeWindowSchema = z.object({
  start: z.string(),
  end: z.string(),
});
export type TimeWindow = z.infer<typeof timeWindowSchema>;

export const jobSlotSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  clientId: z.string().optional().nullable(),
  serviceProfile: z.custom<ServiceProfileType>(),
  durationMinutes: z.number().int().nonnegative(),
  priority: z.number().int().default(1),
  earliestStart: z.string(),
  latestEnd: z.string(),
  hints: z
    .object({
      morningPreferred: z.boolean().optional(),
      requiresTwoTechs: z.boolean().optional(),
      avoidFridays: z.boolean().optional(),
    })
    .optional(),
  quoteId: z.string().optional(),
});
export type JobSlot = z.infer<typeof jobSlotSchema>;

export const routeStopSchema = z.object({
  jobSlotId: z.string(),
  arrivalTime: z.string(),
  departureTime: z.string(),
  travelMinutes: z.number().int().nonnegative(),
});
export type RouteStop = z.infer<typeof routeStopSchema>;

export const dailyRouteSchema = z.object({
  date: z.string(),
  technicianId: z.string().optional().nullable(),
  stops: z.array(routeStopSchema),
  totalDriveMinutes: z.number().int().nonnegative(),
  totalWorkMinutes: z.number().int().nonnegative(),
  status: z.enum(["planned", "in-progress", "completed"]).default("planned"),
  mode: z.enum(["travel_minimized", "balanced_load", "even_distribution"]).default("travel_minimized"),
});
export type DailyRoute = z.infer<typeof dailyRouteSchema>;
