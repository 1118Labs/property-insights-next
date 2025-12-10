import { BaseQuoteResult, QuoteFrequency } from "./types";

export type PressureWashingInput = {
  surfaceSqft?: number;
  propertySqft?: number;
  stories?: number;
  hasDriveway?: boolean;
  drivewaySqft?: number;
  frequency?: QuoteFrequency;
  notes?: string;
};

type PressureWashingConfig = {
  baseRatePerSqft: number;
  drivewayRatePerSqft: number;
  timePerSqftMinutes: number;
  multiStoryMultiplier: number;
  minJobPrice: number;
  hourlyRatePerCleaner: number;
  marginTarget: number;
};

const defaultPressureConfig: PressureWashingConfig = {
  baseRatePerSqft: 0.15,
  drivewayRatePerSqft: 0.1,
  timePerSqftMinutes: 0.09,
  multiStoryMultiplier: 1.15,
  minJobPrice: 180,
  hourlyRatePerCleaner: 32,
  marginTarget: 0.5,
};

export function buildPressureWashingQuote(
  input: PressureWashingInput,
  config: PressureWashingConfig = defaultPressureConfig
): BaseQuoteResult & { trade: "pressure_washing" } {
  const riskFlags: string[] = [];
  const assumptions: string[] = [];

  const surfaceSqft =
    typeof input.surfaceSqft === "number" && input.surfaceSqft > 0
      ? input.surfaceSqft
      : typeof input.propertySqft === "number" && input.propertySqft > 0
      ? Math.round(input.propertySqft * 0.5)
      : 1200;

  const drivewaySqft =
    input.hasDriveway && typeof input.drivewaySqft === "number" && input.drivewaySqft > 0
      ? input.drivewaySqft
      : input.hasDriveway
      ? 600
      : 0;

  if (!input.surfaceSqft) {
    riskFlags.push("Surface sqft estimated; confirm onsite.");
  }
  if (input.hasDriveway && !input.drivewaySqft) {
    riskFlags.push("Driveway size estimated; confirm onsite.");
  }
  if ((input.stories ?? 1) > 2) {
    riskFlags.push("Stories > 2 — consider lift or special equipment.");
  }

  const wallPrice = surfaceSqft * config.baseRatePerSqft;
  const drivePrice = drivewaySqft * config.drivewayRatePerSqft;

  let minutes =
    (surfaceSqft + drivewaySqft) * config.timePerSqftMinutes;
  if ((input.stories ?? 1) > 1) {
    minutes *= config.multiStoryMultiplier;
  }

  const estimatedMinutes = Math.max(45, Math.round(minutes));
  const crewSize = Math.max(1, Math.min(3, Math.round(estimatedMinutes / 240)));
  const estimatedHoursPerCrew = Math.round((estimatedMinutes / 60 / crewSize) * 100) / 100;

  const internalCost =
    config.hourlyRatePerCleaner * crewSize * estimatedHoursPerCrew;

  const baseServicePrice = wallPrice + drivePrice;

  const basePrice = Math.max(
    config.minJobPrice,
    Math.round(((internalCost + baseServicePrice) / (1 - config.marginTarget)) * 100) /
      100
  );

  const customerPrice = Math.round(basePrice);

  const lowHighRange = {
    low: Math.round(customerPrice * 0.9),
    high: Math.round(customerPrice * 1.15),
  };

  assumptions.push("Exterior washing assumes average grime (no heavy oil/grease).");
  assumptions.push("Crew size adjustable based on access and equipment.");

  const lineItems = [
    { label: "Exterior surfaces", amount: Math.round(wallPrice * 100) / 100 },
    ...(drivewaySqft ? [{ label: "Driveway/flatwork", amount: Math.round(drivePrice * 100) / 100 }] : []),
  ];

  return {
    trade: "pressure_washing",
    estimatedMinutes,
    recommendedCrewSize: crewSize,
    estimatedHoursPerCrew,
    basePrice,
    customerPrice,
    lowHighRange,
    lineItems,
    riskFlags,
    assumptions,
  };
}
