import { randomUUID } from "crypto";
import { PropertyProfile, ServiceProfileType } from "@/lib/types";
import { Quote, QuoteItem } from "@/lib/quotes/quote";
import { getPricingProfile, getTaxRate } from "@/lib/quotes/pricingProfiles";
import { getCache, setCache } from "@/lib/utils/cache";
import { quoteNarrative } from "@/lib/quotes/narrative";

function roundTo(value: number, step = 25) {
  return Math.round(value / step) * step;
}

function buildItem(label: string, quantity: number, unit: string, rate: number, metadata?: Record<string, unknown>): QuoteItem {
  const qty = Math.max(0, quantity);
  const total = Math.max(0, Math.round(qty * rate * 100) / 100);
  return { label, quantity: qty, unit, unitPrice: rate, total, metadata };
}

function recommendUpsells(profile: ServiceProfileType): QuoteItem[] {
  switch (profile) {
    case "lawncare":
      return [buildItem("Hedge trimming", 1, "job", 45), buildItem("Aeration", 1, "job", 75)];
    case "cleaning":
      return [buildItem("Deep cleaning add-on", 1, "job", 120), buildItem("Interior windows", 1, "job", 65)];
    case "painting":
      return [buildItem("Trim repaint", 1, "job", 180), buildItem("Shutters refresh", 1, "job", 140)];
    case "roofing":
      return [buildItem("Gutter cleaning add-on", 1, "job", 95)];
    default:
      return [];
  }
}

export function buildQuote(
  profile: PropertyProfile,
  serviceProfile: ServiceProfileType,
  options?: { taxRate?: number; urgencyMultiplier?: number; complexityMultiplier?: number }
): Quote {
  const pricing = getPricingProfile(serviceProfile);
  const taxRate = options?.taxRate ?? getTaxRate();
  const key = profile.property.id && `${profile.property.id}:${serviceProfile}:${profile.insights.lastUpdated}`;
  const cached = key ? getCache<Quote>(`quote:${key}`) : null;
  if (cached) return cached;

  const items: QuoteItem[] = [];
  const recommendedItems = recommendUpsells(serviceProfile);
  const confidenceWarnings: string[] = [];
  if (profile.insights.confidenceScore !== undefined && profile.insights.confidenceScore < 60) {
    confidenceWarnings.push("Insight confidence is low; verify measurements before finalizing.");
  }
  const complexityMultiplier = options?.complexityMultiplier ?? (profile.insights.riskFlags.some((f) => f.severity === "high") ? 1.12 : 1.0);
  const urgencyMultiplier = options?.urgencyMultiplier ?? 1.0;

  const sqft = profile.property.sqft || profile.insights.breakdown.lotAppeal || 1500;
  const lot = profile.property.lotSizeSqft || 6000;
  const beds = profile.property.beds || 3;
  const baths = profile.property.baths || 2;
  const serviceSpecific = profile.insights.serviceSpecific || {};

  switch (serviceProfile) {
    case "cleaning": {
      const baseRate = pricing.base?.rate ?? 0.18;
      const sq = roundTo(sqft);
      items.push(buildItem("Base cleaning", sq, "sqft", baseRate));
      if (pricing.bedroom) items.push(buildItem("Bedrooms", beds, "room", pricing.bedroom.rate));
      if (pricing.bathroom) items.push(buildItem("Bathrooms", baths, "room", pricing.bathroom.rate));
      break;
    }
    case "lawncare": {
      const yard = roundTo((serviceSpecific as any).yardSize ?? lot);
      if (pricing.mow) items.push(buildItem("Mowing", yard, "sqft", pricing.mow.rate));
      if (pricing.edging) items.push(buildItem("Edging", (serviceSpecific as any).edgingFeet ?? Math.sqrt(yard) * 4, "linear ft", pricing.edging.rate));
      if (pricing.tree) items.push(buildItem("Tree surcharge", (serviceSpecific as any).treeDensity === "medium" ? 2 : 1, "trees", pricing.tree.rate));
      break;
    }
    case "roofing": {
      const roofArea = roundTo((serviceSpecific as any).roofArea ?? lot * 1.1);
      const base = buildItem("Roof area", roofArea, "sqft", pricing.roofSqft?.rate ?? 2.5);
      items.push(base);
      if ((serviceSpecific as any).pitch === "steep" && pricing.steepMultiplier) {
        items.push(buildItem("Steep pitch multiplier", 1, "factor", pricing.steepMultiplier.rate * base.total));
        items.push(buildItem("Access difficulty", 1, "factor", base.total * 0.08));
      }
      break;
    }
    case "painting": {
      const sidingArea = roundTo((serviceSpecific as any).sidingArea ?? sqft * 2.2);
      items.push(buildItem("Siding paint", sidingArea, "sqft", pricing.sidingSqft?.rate ?? 1.8));
      if (pricing.trimMultiplier) {
        items.push(buildItem("Trim complexity", 1, "factor", pricing.trimMultiplier.rate * items[0].total));
      }
      break;
    }
    case "window_washing": {
      const windows = (serviceSpecific as any).windowCount ?? beds * 3 + baths * 2 + 6;
      items.push(buildItem("Windows", windows, "window", pricing.window?.rate ?? 8));
      if (pricing.difficultyMultiplier && (serviceSpecific as any).accessDifficulty === "ladder") {
        items.push(buildItem("Access difficulty", 1, "factor", pricing.difficultyMultiplier.rate * items[0].total));
      }
      break;
    }
    case "pressure_washing": {
      const drive = roundTo((serviceSpecific as any).drivewayArea ?? lot * 0.25);
      const walk = roundTo((serviceSpecific as any).walkwayLength ?? Math.sqrt(lot), 10);
      if (pricing.driveway) items.push(buildItem("Driveway wash", drive, "sqft", pricing.driveway.rate));
      if (pricing.walkway) items.push(buildItem("Walkway wash", walk, "linear ft", pricing.walkway.rate));
      if (pricing.siding) items.push(buildItem("Siding wash", roundTo(sqft * 0.8), "sqft", pricing.siding.rate));
      break;
    }
    case "gutter_cleaning": {
      const linear = roundTo((serviceSpecific as any).linearFootage ?? Math.sqrt(lot) * 4, 10);
      if (pricing.linearFoot) items.push(buildItem("Gutter cleaning", linear, "linear ft", pricing.linearFoot.rate));
      break;
    }
    case "snow_removal": {
      const plowable = roundTo((serviceSpecific as any).drivewayArea ?? lot * 0.3);
      const frontage = (serviceSpecific as any).frontage ?? Math.sqrt(lot);
      if (pricing.plowableSqft) items.push(buildItem("Plowable area", plowable, "sqft", pricing.plowableSqft.rate));
      if (pricing.frontage) items.push(buildItem("Frontage/sidewalk", frontage, "linear ft", pricing.frontage.rate));
      break;
    }
    case "pool_service": {
      const base = pricing.base?.rate ?? 120;
      items.push(buildItem("Pool service", 1, "job", base));
      if ((serviceSpecific as any).poolType && pricing.poolTypeMultiplier) {
        const multiplier = (serviceSpecific as any).poolType === "in-ground" ? 1.2 : 1.0;
        items.push(buildItem("Pool complexity", 1, "factor", base * pricing.poolTypeMultiplier.rate * multiplier));
      }
      break;
    }
    default:
      items.push(buildItem("Base service", 1, "job", 100));
      break;
  }

  let subtotal = Math.round(items.reduce((acc, i) => acc + i.total, 0) * 100) / 100;
  subtotal = Math.round(subtotal * complexityMultiplier * urgencyMultiplier * 100) / 100;
  const tax = Math.round(subtotal * taxRate * 100) / 100;
  const total = Math.round((subtotal + tax) * 100) / 100;

  const quote: Quote = {
    id: randomUUID(),
    propertyId: profile.property.id || undefined,
    clientId: profile.client?.id || undefined,
    serviceProfile,
    items,
    subtotal,
    tax,
    total,
    notes: quoteNarrative(profile),
    recommendedItems,
    confidenceWarnings: confidenceWarnings.length ? confidenceWarnings : undefined,
    version: 1,
    createdAt: new Date().toISOString(),
  };

  if (key) setCache(`quote:${key}`, quote, 5 * 60 * 1000);
  return quote;
}

export function compareQuotes(a: Quote, b: Quote) {
  return {
    left: a,
    right: b,
    delta: b.total - a.total,
    moreExpensive: b.total > a.total ? "right" : b.total < a.total ? "left" : "equal",
  };
}
