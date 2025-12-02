import { PropertyProfile } from "@/lib/types";
import { getSchedulingConfig } from "@/lib/scheduling/config";

export function estimateDuration(profile: PropertyProfile): { minutes: number; confidence: number } {
  const cfg = getSchedulingConfig();
  const svc = (profile.insights.serviceProfile || "cleaning") as keyof typeof cfg.defaultDurations;
  const base = cfg.defaultDurations[svc] || 120;
  const prop = profile.property;
  const specific = profile.insights.serviceSpecific || {};

  let minutes = base;
  switch (svc) {
    case "cleaning":
      minutes = (prop.sqft || 1500) / 10 + (prop.beds || 3) * 10 + (prop.baths || 2) * 15;
      break;
    case "lawncare":
      minutes = ((specific as any).yardSize || prop.lotSizeSqft || 6000) / 80 + 20;
      break;
    case "roofing":
      minutes = (((specific as any).roofArea || (prop.lotSizeSqft || 6000) * 1.1) / 60) * 45;
      if ((specific as any).pitch === "steep") minutes *= 1.2;
      break;
    case "painting":
      minutes = (((specific as any).sidingArea || (prop.sqft || 1500) * 2) / 100) * 45;
      break;
    case "window_washing":
      minutes = (((specific as any).windowCount || (prop.beds || 3) * 3 + (prop.baths || 2) * 2 + 6) * 5);
      if ((specific as any).accessDifficulty === "ladder") minutes *= 1.15;
      break;
    case "pressure_washing":
      minutes = (((specific as any).drivewayArea || (prop.lotSizeSqft || 6000) * 0.2) / 100) * 20 + 30;
      break;
    case "gutter_cleaning":
      minutes = (((specific as any).linearFootage || Math.sqrt(prop.lotSizeSqft || 6000) * 4) / 40) * 30;
      break;
    case "snow_removal":
      minutes = (((specific as any).drivewayArea || (prop.lotSizeSqft || 6000) * 0.3) / 100) * 10 + 20;
      break;
    case "pool_service":
      minutes = 60;
      break;
    default:
      minutes = base;
  }

  const confidence = Math.max(40, Math.min(95, (profile.insights.confidenceScore || 70) - (profile.insights.riskFlags.length || 0) * 3));
  return { minutes: Math.round(minutes), confidence };
}
