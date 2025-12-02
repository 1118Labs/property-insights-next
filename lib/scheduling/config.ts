import { z } from "zod";
import { ServiceProfileType } from "@/lib/types";

export const schedulingConfigSchema = z.object({
  workingHours: z.object({ start: z.string().default("08:00"), end: z.string().default("18:00") }),
  maxDailyMinutes: z.number().default(480),
  horizonDays: z.number().default(7),
  avgSpeedKmh: z.number().default(40),
  defaultDurations: z.record(z.custom<ServiceProfileType>(), z.number()).optional(),
});

const configState = {
  workingHours: { start: "08:00", end: "18:00" },
  maxDailyMinutes: 480,
  horizonDays: 7,
  avgSpeedKmh: 40,
  defaultDurations: {
    cleaning: 120,
    lawncare: 90,
    roofing: 180,
    painting: 240,
    window_washing: 120,
    pressure_washing: 150,
    gutter_cleaning: 90,
    snow_removal: 120,
    pool_service: 60,
  } as Record<ServiceProfileType, number>,
};

export function getSchedulingConfig() {
  return { ...configState };
}

export function updateSchedulingConfig(input: unknown) {
  const parsed = schedulingConfigSchema.deepPartial().safeParse(input);
  if (!parsed.success) {
    throw new Error("Invalid scheduling config");
  }
  Object.assign(configState, parsed.data);
  if (parsed.data.defaultDurations) {
    configState.defaultDurations = { ...configState.defaultDurations, ...parsed.data.defaultDurations };
  }
  return getSchedulingConfig();
}
