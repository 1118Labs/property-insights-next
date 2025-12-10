import { buildCleaningQuote } from "./cleaning";
import { buildPressureWashingQuote } from "./pressureWashing";
import { buildWindowWashingQuote } from "./windowWashing";
import { buildLawnCareQuote } from "./lawnCare";
import { buildHandymanQuote } from "./handyman";
import { BaseQuoteResult } from "./types";

export type SupportedServiceType =
  | "cleaning"
  | "pressure_washing"
  | "window_washing"
  | "lawn_care"
  | "handyman";

export {
  buildCleaningQuote,
  buildPressureWashingQuote,
  buildWindowWashingQuote,
  buildLawnCareQuote,
  buildHandymanQuote,
};

export function buildQuote(type: SupportedServiceType, input: unknown): BaseQuoteResult & { trade: SupportedServiceType } {
  switch (type) {
    case "cleaning":
      return { trade: "cleaning", ...buildCleaningQuote(input as any) };
    case "pressure_washing":
      return buildPressureWashingQuote(input);
    case "window_washing":
      return buildWindowWashingQuote(input);
    case "lawn_care":
      return buildLawnCareQuote(input);
    case "handyman":
      return buildHandymanQuote(input);
    default:
      throw new Error(`Unsupported quote type: ${type}`);
  }
}
