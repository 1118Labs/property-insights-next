import { BaseQuoteResult, QuoteFrequency } from "./types";

export type LawnCareInput = {
  lawnSqft?: number;
  lotSizeSqft?: number;
  propertySqft?: number;
  mowingOnly?: boolean;
  includesEdging?: boolean;
  includesHedgeTrim?: boolean;
  frequency?: QuoteFrequency;
  notes?: string;
};

type LawnCareConfig = {
  baseRatePerSqftMowing: number;
  edgingAddonRatePerFt: number;
  hedgeTrimAddonFlat: number;
  timePerSqftMinutes: number;
  minJobPrice: number;
  hourlyRatePerCleaner: number;
  marginTarget: number;
  recurringDiscountBiweekly: number;
  recurringDiscountWeekly: number;
  recurringDiscountMonthly: number;
};

const defaultLawnConfig: LawnCareConfig = {
  baseRatePerSqftMowing: 0.012,
  edgingAddonRatePerFt: 0.35,
  hedgeTrimAddonFlat: 45,
  timePerSqftMinutes: 0.002,
  minJobPrice: 85,
  hourlyRatePerCleaner: 28,
  marginTarget: 0.45,
  recurringDiscountBiweekly: 0.05,
  recurringDiscountWeekly: 0.12,
  recurringDiscountMonthly: 0,
};

function applyLawnFrequency(price: number, freq?: QuoteFrequency, config = defaultLawnConfig) {
  if (freq === "weekly") return price * (1 - config.recurringDiscountWeekly);
  if (freq === "biweekly") return price * (1 - config.recurringDiscountBiweekly);
  if (freq === "monthly") return price * (1 - config.recurringDiscountMonthly);
  return price;
}

export function buildLawnCareQuote(
  input: LawnCareInput,
  config: LawnCareConfig = defaultLawnConfig
): BaseQuoteResult & { trade: "lawn_care" } {
  const riskFlags: string[] = [];
  const assumptions: string[] = [];

  const lawnSqft =
    typeof input.lawnSqft === "number" && input.lawnSqft > 0
      ? input.lawnSqft
      : typeof input.lotSizeSqft === "number" && input.lotSizeSqft > 0
      ? Math.round(input.lotSizeSqft * 0.6)
      : typeof input.propertySqft === "number" && input.propertySqft > 0
      ? Math.round(input.propertySqft * 0.3)
      : 4000;

  if (!input.lawnSqft) {
    riskFlags.push("Lawn sqft estimated; verify property size.");
  }

  const edgingLinearFeet = Math.max(0, Math.round(Math.sqrt(lawnSqft) * 4));

  const mowingPrice = lawnSqft * config.baseRatePerSqftMowing;
  const edgingPrice =
    input.includesEdging === false
      ? 0
      : edgingLinearFeet * config.edgingAddonRatePerFt;
  const hedgePrice =
    input.includesHedgeTrim === true ? config.hedgeTrimAddonFlat : 0;

  let minutes = lawnSqft * config.timePerSqftMinutes;
  if (input.includesHedgeTrim) minutes += 25;
  if (input.includesEdging !== false) minutes += edgingLinearFeet * 0.05;

  const estimatedMinutes = Math.max(35, Math.round(minutes));
  const crewSize = Math.max(1, Math.min(3, Math.round(estimatedMinutes / 180)));
  const estimatedHoursPerCrew = Math.round((estimatedMinutes / 60 / crewSize) * 100) / 100;

  const internalCost =
    config.hourlyRatePerCleaner * crewSize * estimatedHoursPerCrew;

  const servicePrice = mowingPrice + edgingPrice + hedgePrice;

  let basePrice = Math.max(
    config.minJobPrice,
    Math.round(((internalCost + servicePrice) / (1 - config.marginTarget)) * 100) /
      100
  );

  basePrice = Math.max(
    config.minJobPrice,
    applyLawnFrequency(basePrice, input.frequency, config)
  );
  const customerPrice = Math.round(basePrice);

  const lowHighRange = {
    low: Math.round(customerPrice * 0.9),
    high: Math.round(customerPrice * 1.12),
  };

  assumptions.push("Assumes normal grass height and no debris removal.");
  if (input.includesHedgeTrim) {
    riskFlags.push("Hedge trimming included — may need additional time.");
  }

  const lineItems = [
    { label: "Mowing", amount: Math.round(mowingPrice * 100) / 100 },
    ...(edgingPrice ? [{ label: "Edging", amount: Math.round(edgingPrice * 100) / 100 }] : []),
    ...(hedgePrice ? [{ label: "Hedge trimming", amount: hedgePrice }] : []),
  ];

  return {
    trade: "lawn_care",
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
