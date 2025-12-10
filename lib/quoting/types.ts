export type QuoteFrequency = "one_time" | "weekly" | "biweekly" | "monthly";

export type BaseQuoteResult = {
  estimatedMinutes: number;
  recommendedCrewSize: number;
  estimatedHoursPerCrew: number;
  basePrice: number;
  customerPrice: number;
  lowHighRange: { low: number; high: number };
  lineItems: { label: string; amount: number }[];
  riskFlags: string[];
  assumptions: string[];
};
