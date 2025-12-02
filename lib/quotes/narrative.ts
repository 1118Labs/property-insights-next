import { PropertyProfile } from "@/lib/types";
import { generateNarrative } from "@/lib/insights_extra";

export function quoteNarrative(profile: PropertyProfile) {
  const base = generateNarrative(profile.property, profile.insights);
  const costDrivers: string[] = [];
  if (profile.property.sqft) costDrivers.push(`Area: ${profile.property.sqft.toLocaleString()} sqft drives base scope.`);
  if (profile.property.lotSizeSqft) costDrivers.push(`Lot: ${profile.property.lotSizeSqft.toLocaleString()} sqft influences exterior work.`);
  if (profile.insights.riskFlags.length) costDrivers.push(`Risks: ${profile.insights.riskFlags.map((r) => r.label).join(", ")}`);
  return [base, costDrivers.join(" ")].filter(Boolean).join(" ");
}
