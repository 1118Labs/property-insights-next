import { BaseQuoteResult, QuoteFrequency } from "./types";

export type WindowWashingInput = {
  interiorWindows?: number;
  exteriorWindows?: number;
  beds?: number;
  baths?: number;
  stories?: number;
  hasScreens?: boolean;
  frequency?: QuoteFrequency;
  notes?: string;
};

type WindowWashingConfig = {
  ratePerWindowInterior: number;
  ratePerWindowExterior: number;
  screenAddOnRatePerWindow: number;
  timePerWindowMinutes: number;
  multiStoryMultiplier: number;
  minJobPrice: number;
  hourlyRatePerCleaner: number;
  marginTarget: number;
};

const defaultWindowConfig: WindowWashingConfig = {
  ratePerWindowInterior: 6,
  ratePerWindowExterior: 5,
  screenAddOnRatePerWindow: 1.5,
  timePerWindowMinutes: 4,
  multiStoryMultiplier: 1.15,
  minJobPrice: 160,
  hourlyRatePerCleaner: 30,
  marginTarget: 0.5,
};

function estimateWindowCounts(beds?: number, baths?: number) {
  const b = typeof beds === "number" && beds > 0 ? beds : 3;
  const ba = typeof baths === "number" && baths > 0 ? baths : 2;
  const total = b * 3 + ba * 1 + 4;
  return { interior: total, exterior: total };
}

export function buildWindowWashingQuote(
  input: WindowWashingInput,
  config: WindowWashingConfig = defaultWindowConfig
): BaseQuoteResult & { trade: "window_washing" } {
  const riskFlags: string[] = [];
  const assumptions: string[] = [];

  const estimatedCounts = estimateWindowCounts(input.beds, input.baths);
  const interiorWindows =
    typeof input.interiorWindows === "number" && input.interiorWindows >= 0
      ? input.interiorWindows
      : estimatedCounts.interior;
  const exteriorWindows =
    typeof input.exteriorWindows === "number" && input.exteriorWindows >= 0
      ? input.exteriorWindows
      : estimatedCounts.exterior;

  if (input.interiorWindows == null || input.exteriorWindows == null) {
    riskFlags.push("Window counts estimated; verify onsite.");
  }

  if ((input.stories ?? 1) >= 2) {
    riskFlags.push("2+ stories — ladder safety and extra time required.");
  }

  const screenCount =
    input.hasScreens === true ? Math.max(interiorWindows, exteriorWindows) : 0;

  const priceInterior = interiorWindows * config.ratePerWindowInterior;
  const priceExterior = exteriorWindows * config.ratePerWindowExterior;
  const priceScreens = screenCount * config.screenAddOnRatePerWindow;

  let minutes =
    (interiorWindows + exteriorWindows) * config.timePerWindowMinutes;
  if ((input.stories ?? 1) >= 2) {
    minutes *= config.multiStoryMultiplier;
  }

  const estimatedMinutes = Math.max(60, Math.round(minutes));
  const crewSize = Math.max(1, Math.min(3, Math.round(estimatedMinutes / 240)));
  const estimatedHoursPerCrew = Math.round((estimatedMinutes / 60 / crewSize) * 100) / 100;

  const internalCost =
    config.hourlyRatePerCleaner * crewSize * estimatedHoursPerCrew;

  const servicePrice = priceInterior + priceExterior + priceScreens;

  const basePrice = Math.max(
    config.minJobPrice,
    Math.round(((internalCost + servicePrice) / (1 - config.marginTarget)) * 100) /
      100
  );

  const customerPrice = Math.round(basePrice);

  const lowHighRange = {
    low: Math.round(customerPrice * 0.9),
    high: Math.round(customerPrice * 1.15),
  };

  assumptions.push("Assumes standard window sizes and accessibility.");
  assumptions.push("Screen removal/reinstall included when screens selected.");

  const lineItems = [
    { label: "Interior windows", amount: Math.round(priceInterior * 100) / 100 },
    { label: "Exterior windows", amount: Math.round(priceExterior * 100) / 100 },
    ...(priceScreens
      ? [{ label: "Screens", amount: Math.round(priceScreens * 100) / 100 }]
      : []),
  ];

  return {
    trade: "window_washing",
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
