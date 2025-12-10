import { BaseQuoteResult, QuoteFrequency } from "./types";

export type CleaningQuoteInput = {
  propertySqft?: number;
  beds?: number;
  baths?: number;
  propertyType?:
    | "single_family"
    | "multi_family"
    | "apartment"
    | "condo"
    | "townhouse"
    | "other";
  isFirstTime?: boolean;
  hasPets?: boolean;
  frequency?: QuoteFrequency;
  notes?: string;
};

export type CleaningQuoteConfig = {
  baseRatePerSqft: number;
  recurringDiscountWeekly: number;
  recurringDiscountBiweekly: number;
  recurringDiscountMonthly: number;
  minJobPrice: number;
  timePerSqftMinutes: number;
  firstTimeMultiplier: number;
  petsMultiplier: number;
  bathComplexityPerBathMinutes: number;
  bedComplexityPerBedMinutes: number;
  maxCrewSize: number;
  hourlyRatePerCleaner: number;
  marginTarget: number;
};

export type CleaningQuoteResult = BaseQuoteResult;

export const defaultCleaningConfig: CleaningQuoteConfig = {
  baseRatePerSqft: 0.21,
  recurringDiscountWeekly: 0.25,
  recurringDiscountBiweekly: 0.15,
  recurringDiscountMonthly: 0.05,
  minJobPrice: 150,
  timePerSqftMinutes: 0.06,
  firstTimeMultiplier: 1.3,
  petsMultiplier: 1.1,
  bathComplexityPerBathMinutes: 12,
  bedComplexityPerBedMinutes: 6,
  maxCrewSize: 3,
  hourlyRatePerCleaner: 30,
  marginTarget: 0.5,
};

function coalesceNumber(...values: Array<number | undefined | null>) {
  for (const v of values) {
    if (typeof v === "number" && Number.isFinite(v)) return v;
  }
  return undefined;
}

function estimateSqftFromRooms(beds?: number, baths?: number): number | undefined {
  if (beds == null && baths == null) return undefined;
  const bed = typeof beds === "number" && beds > 0 ? beds : 3;
  if (bed <= 1) return 700;
  if (bed === 2) return 1100;
  if (bed === 3) return 1600;
  if (bed === 4) return 2100;
  return 2600 + Math.max(0, bed - 5) * 300 + (typeof baths === "number" ? baths * 50 : 0);
}

function applyFrequencyDiscount(
  price: number,
  frequency: CleaningQuoteInput["frequency"],
  config: CleaningQuoteConfig
): { price: number; discountApplied: number } {
  let discount = 0;
  if (frequency === "weekly") discount = config.recurringDiscountWeekly;
  else if (frequency === "biweekly") discount = config.recurringDiscountBiweekly;
  else if (frequency === "monthly") discount = config.recurringDiscountMonthly;

  const discounted = price * (1 - discount);
  return { price: discounted, discountApplied: discount };
}

export function buildCleaningQuote(
  input: CleaningQuoteInput,
  config: CleaningQuoteConfig = defaultCleaningConfig
): CleaningQuoteResult {
  const riskFlags: string[] = [];
  const assumptions: string[] = [];

  const sqft =
    coalesceNumber(input.propertySqft) ??
    (estimateSqftFromRooms(input.beds, input.baths) ?? undefined);

  if (!input.propertySqft && sqft) {
    riskFlags.push("Sqft estimated from bed/bath count.");
    assumptions.push(
      `Estimated ${sqft.toLocaleString()} sqft from ${input.beds ?? "n/a"} beds and ${input.baths ?? "n/a"} baths.`
    );
  }
  if (!sqft) {
    riskFlags.push("No sqft data");
    assumptions.push("Used minimal sqft baseline due to missing data.");
  }

  const effectiveSqft = sqft ?? 1200;
  if (effectiveSqft > 3500)
    riskFlags.push("Very large property — consider in-person walkthrough.");

  const beds = typeof input.beds === "number" ? input.beds : 0;
  const baths = typeof input.baths === "number" ? input.baths : 0;
  if (baths >= 4) riskFlags.push("Many bathrooms — adjust time on site.");

  const baseMinutes =
    effectiveSqft * config.timePerSqftMinutes +
    baths * config.bathComplexityPerBathMinutes +
    beds * config.bedComplexityPerBedMinutes;

  let adjustedMinutes = baseMinutes;
  const lineItems: { label: string; amount: number }[] = [
    { label: "Base residential cleaning", amount: baseMinutes },
  ];

  if (input.isFirstTime) {
    adjustedMinutes *= config.firstTimeMultiplier;
    lineItems.push({ label: "First-time adjustment", amount: adjustedMinutes - baseMinutes });
  }

  if (input.hasPets) {
    adjustedMinutes *= config.petsMultiplier;
    lineItems.push({ label: "Pet household adjustment", amount: adjustedMinutes - baseMinutes });
  }

  const estimatedMinutes = Math.max(60, Math.round(adjustedMinutes));
  const crewSize = Math.min(
    config.maxCrewSize,
    Math.max(1, Math.round(estimatedMinutes / 240))
  );
  const estimatedHoursPerCrew = Math.round((estimatedMinutes / 60 / crewSize) * 100) / 100;

  const internalCost =
    config.hourlyRatePerCleaner * crewSize * estimatedHoursPerCrew;

  const basePrice = Math.max(
    config.minJobPrice,
    Math.round((internalCost / (1 - config.marginTarget)) * 100) / 100
  );

  let customerPrice = basePrice;
  let discountApplied = 0;
  if (input.frequency && input.frequency !== "one_time") {
    const discounted = applyFrequencyDiscount(basePrice, input.frequency, config);
    customerPrice = Math.max(config.minJobPrice, Math.round(discounted.price * 100) / 100);
    discountApplied = discounted.discountApplied;
    if (discountApplied > 0) {
      lineItems.push({
        label: "Recurring discount",
        amount: -Math.round(basePrice * discountApplied * 100) / 100,
      });
    }
  } else if (input.frequency === "one_time" && input.isFirstTime === false) {
    riskFlags.push("One-time cleaning flagged but not marked first-time; double-check expectations.");
  }

  const lowHighRange = {
    low: Math.round(customerPrice * 0.9),
    high: Math.round(customerPrice * 1.15),
  };

  const assumptionsBase = [
    `Crew size capped at ${config.maxCrewSize}.`,
    `Target margin ${Math.round(config.marginTarget * 100)}%.`,
    "Assumes average home condition (no hoarding or extreme buildup).",
    "Crew count adjustable based on staffing and route density.",
  ];

  if (discountApplied > 0) {
    assumptionsBase.push(
      `Applied ${
        Math.round(discountApplied * 100)
      }% recurring discount for ${input.frequency}.`
    );
  }

  return {
    estimatedMinutes,
    recommendedCrewSize: crewSize,
    estimatedHoursPerCrew,
    basePrice,
    customerPrice,
    lowHighRange,
    lineItems,
    riskFlags,
    assumptions: [...assumptionsBase, ...assumptions],
  };
}
