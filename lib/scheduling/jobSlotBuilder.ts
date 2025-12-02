import { randomUUID } from "crypto";
import { fetchProfileById } from "@/lib/insights";
import { estimateDuration } from "@/lib/scheduling/durationEstimator";
import { JobSlot } from "@/lib/scheduling/types";
import { getSchedulingConfig } from "@/lib/scheduling/config";
import { getQuote } from "@/lib/quotes/store";

function windowForToday() {
  const cfg = getSchedulingConfig();
  const today = new Date().toISOString().split("T")[0];
  return {
    earliest: `${today}T${cfg.workingHours.start}:00Z`,
    latest: `${today}T${cfg.workingHours.end}:00Z`,
  };
}

export async function buildJobSlot(params: { propertyId: string; clientId?: string | null; serviceProfile?: string; quoteId?: string }) {
  const profile = await fetchProfileById(params.propertyId);
  if (!profile) throw new Error("Property not found");
  const duration = estimateDuration(profile);
  const { earliest, latest } = windowForToday();
  const hints = { morningPreferred: Boolean(profile.insights.riskFlags.find((r) => r.severity === "high")) };
  const slot: JobSlot = {
    id: randomUUID(),
    propertyId: params.propertyId,
    clientId: params.clientId || profile.client?.id || undefined,
    serviceProfile: (params.serviceProfile || profile.insights.serviceProfile || "cleaning") as any,
    durationMinutes: duration.minutes,
    priority: 1,
    earliestStart: earliest,
    latestEnd: latest,
    hints,
    quoteId: params.quoteId || undefined,
  };
  return slot;
}
