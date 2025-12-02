import { PricingProfile } from "@/lib/quotes/quote";
import { ServiceProfileType } from "@/lib/types";

type ProfileMap = Record<ServiceProfileType, PricingProfile>;

const defaults: ProfileMap = {
  cleaning: {
    base: { rate: 0.18 },
    bedroom: { rate: 25 },
    bathroom: { rate: 35 },
  },
  lawncare: {
    mow: { rate: 0.06 },
    edging: { rate: 0.02 },
    tree: { rate: 15 },
  },
  roofing: {
    roofSqft: { rate: 2.5 },
    steepMultiplier: { rate: 0.25 },
  },
  painting: {
    sidingSqft: { rate: 1.8 },
    trimMultiplier: { rate: 0.2 },
  },
  window_washing: {
    window: { rate: 8 },
    difficultyMultiplier: { rate: 0.15 },
  },
  pressure_washing: {
    driveway: { rate: 0.22 },
    walkway: { rate: 0.2 },
    siding: { rate: 0.18 },
  },
  gutter_cleaning: {
    linearFoot: { rate: 1.25 },
  },
  snow_removal: {
    plowableSqft: { rate: 0.12 },
    frontage: { rate: 0.5 },
  },
  pool_service: {
    base: { rate: 120 },
    poolTypeMultiplier: { rate: 0.15 },
  },
};

const overrides: Partial<ProfileMap> = {};
let taxRate = 0.0725;

// Apply env overrides if provided as JSON blob
try {
  if (process.env.PRICING_OVERRIDES_JSON) {
    const parsed = JSON.parse(process.env.PRICING_OVERRIDES_JSON) as Partial<ProfileMap>;
    Object.entries(parsed).forEach(([k, v]) => {
      overrides[k as ServiceProfileType] = v as PricingProfile;
    });
  }
  if (process.env.PRICING_TAX_RATE) {
    const envTax = Number(process.env.PRICING_TAX_RATE);
    if (Number.isFinite(envTax)) taxRate = Math.max(0, envTax);
  }
} catch {
  // ignore malformed env overrides
}

export function setPricingOverride(profile: ServiceProfileType, value: PricingProfile) {
  overrides[profile] = value;
}

export function getPricingProfile(profile: ServiceProfileType): PricingProfile {
  return overrides[profile] || defaults[profile];
}

export function getAllPricingProfiles() {
  return Object.fromEntries(Object.entries(defaults).map(([k, v]) => [k, overrides[k as ServiceProfileType] || v]));
}

export function setTaxRate(rate: number) {
  taxRate = Math.max(0, rate);
}

export function getTaxRate() {
  return taxRate;
}
