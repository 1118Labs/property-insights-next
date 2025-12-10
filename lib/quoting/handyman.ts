import { BaseQuoteResult } from "./types";

export type HandymanInput = {
  estimatedHours?: number;
  complexity?: "low" | "medium" | "high";
  materialsBudget?: number;
  notes?: string;
};

type HandymanConfig = {
  baseHourlyRateLow: number;
  baseHourlyRateMedium: number;
  baseHourlyRateHigh: number;
  minJobHours: number;
  minJobPrice: number;
  marginTarget: number;
};

const defaultHandymanConfig: HandymanConfig = {
  baseHourlyRateLow: 60,
  baseHourlyRateMedium: 75,
  baseHourlyRateHigh: 95,
  minJobHours: 2,
  minJobPrice: 180,
  marginTarget: 0.35,
};

export function buildHandymanQuote(
  input: HandymanInput,
  config: HandymanConfig = defaultHandymanConfig
): BaseQuoteResult & { trade: "handyman" } {
  const riskFlags: string[] = [];
  const assumptions: string[] = [];

  const hours = Math.max(input.estimatedHours ?? 2, config.minJobHours);
  const complexity = input.complexity ?? "medium";

  const hourlyRate =
    complexity === "high"
      ? config.baseHourlyRateHigh
      : complexity === "low"
      ? config.baseHourlyRateLow
      : config.baseHourlyRateMedium;

  if (complexity === "high") {
    riskFlags.push("High complexity handyman job — consider onsite estimate.");
  }

  const materials = input.materialsBudget ?? 0;
  if (materials > 0) {
    assumptions.push(`Includes materials budget of $${materials.toLocaleString()}; verify with supplier.`);
  } else {
    assumptions.push("Materials not included; pass-through to client.");
  }

  const servicePrice = hours * hourlyRate + materials;
  const estimatedMinutes = Math.round(hours * 60);
  const crewSize = 1;
  const estimatedHoursPerCrew = hours;

  const basePrice = Math.max(
    config.minJobPrice,
    Math.round((servicePrice / (1 - config.marginTarget)) * 100) / 100
  );

  const customerPrice = Math.round(basePrice);
  const lowHighRange = {
    low: Math.round(customerPrice * 0.9),
    high: Math.round(customerPrice * 1.2),
  };

  const lineItems = [
    { label: `Labor (${hours} hrs @ $${hourlyRate}/hr)`, amount: hours * hourlyRate },
    ...(materials ? [{ label: "Materials allowance", amount: materials }] : []),
  ];

  riskFlags.push("Materials budget may fluctuate; verify with supplier.");

  return {
    trade: "handyman",
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
