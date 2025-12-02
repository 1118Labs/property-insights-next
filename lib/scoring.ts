import { PropertyRecord, PropertyInsight, RiskFlag, ScoreBreakdown, ScoreWeights, ScoringContext, ScorePreset } from "./types";

const DEFAULT_WEIGHTS: ScoreWeights = {
  livability: 0.35,
  efficiency: 0.25,
  marketStrength: 0.4,
  riskPenalty: 0.2,
};

const PRESET_WEIGHTS: Record<ScorePreset, ScoreWeights> = {
  conservative: { livability: 0.3, efficiency: 0.25, marketStrength: 0.35, riskPenalty: 0.3 },
  normal: DEFAULT_WEIGHTS,
  aggressive: { livability: 0.4, efficiency: 0.3, marketStrength: 0.4, riskPenalty: 0.1 },
};

const SCORE_VERSION = "1.2.0";

function clamp(value: number, min = 0, max = 100) {
  return Math.max(min, Math.min(max, value));
}

function normalize(value: number | null | undefined, scale: number, weight = 1, { cap = 1.2 } = {}) {
  if (value === null || value === undefined) return 0;
  if (!Number.isFinite(value) || value <= 0) return 0;
  const normalized = (value / scale) * 100 * weight;
  return clamp(normalized, 0, 100 * cap);
}

function buildContext(weights?: Partial<ScoreWeights>, preset: ScorePreset = "normal"): ScoringContext {
  const base = PRESET_WEIGHTS[preset] || DEFAULT_WEIGHTS;
  return {
    currentYear: new Date().getFullYear(),
    weights: { ...base, ...weights },
    scoreVersion: SCORE_VERSION,
  };
}

export function buildRiskFlags(property: PropertyRecord): RiskFlag[] {
  const risks: RiskFlag[] = [];
  if (!property.beds || property.beds < 2) {
    risks.push({ code: "SMALL_FOOTPRINT", label: "Small layout", severity: "low", detail: "Fewer than 2 bedrooms" });
  }
  if (!property.sqft || property.sqft < 900) {
    risks.push({ code: "MINIMAL_SQFT", label: "Compact footprint", severity: "medium", detail: "Square footage below 900" });
  }
  if (property.lotSizeSqft && property.lotSizeSqft < 4000) {
    risks.push({ code: "SMALL_LOT", label: "Tight lot size", severity: "medium" });
  }
  if (property.yearBuilt && property.yearBuilt < 1980) {
    risks.push({
      code: "OLDER_HOME",
      label: "Older construction",
      severity: property.yearBuilt < 1960 ? "high" : "medium",
      detail: "Higher likelihood of latent issues",
    });
  }
  if (!property.yearBuilt) {
    risks.push({ code: "UNKNOWN_AGE", label: "Missing year built", severity: "low", detail: "Age not provided" });
  }
  if (!property.address.city || !property.address.province) {
    risks.push({ code: "MISSING_GEO", label: "Missing city/state", severity: "low", detail: "Location incomplete" });
  }
  return risks;
}

function computeBreakdown(property: PropertyRecord, context: ScoringContext): ScoreBreakdown {
  const { currentYear } = context;
  const age = property.yearBuilt ? currentYear - property.yearBuilt : null;
  const renovationAge = property.renovatedAt ? Math.max(0, currentYear - new Date(property.renovatedAt).getFullYear()) : null;
  const valuation = buildValuation(property);
  const rentEstimate = buildRent(property);
  const priceToRent = valuation?.estimate && rentEstimate?.estimate ? valuation.estimate / (rentEstimate.estimate * 12) : null;

  const livability = clamp(
    normalize(property.beds, 4, 0.6) + normalize(property.baths, 2.5, 0.4),
  );

  const efficiency = clamp(
    normalize(property.sqft, 2400, 0.5, { cap: 1 }) +
      normalize(age ? 80 - age : null, 60, 0.5, { cap: 1 }), // newer homes score better
  );

  const lotAppeal = clamp(normalize(property.lotSizeSqft, 9000, 0.4));

  const marketStrength = clamp(
    lotAppeal +
      normalize(property.beds, 5, 0.2) +
      normalize(property.baths, 3, 0.2) +
      normalize(property.sqft, 1800, 0.2),
  );

  const risk = 100 - clamp(livability * 0.35 + efficiency * 0.3 + marketStrength * 0.35);

  // Age factor: newer homes get higher positive values; older reduce
  const ageFactorRaw = age ? 80 - age : null;
  const renovationBoost = renovationAge !== null ? normalize(renovationAge ? 40 - renovationAge : null, 30, 0.5, { cap: 1 }) : 0;
  const ageFactor = clamp(normalize(ageFactorRaw, 50, 1, { cap: 1 }) + renovationBoost, 0, 100);

  // Equity delta placeholder: higher sqft and newer build imply better equity retention
  const equityDelta = clamp(
    normalize(property.sqft, 2200, 0.5) + normalize(property.yearBuilt ? currentYear - property.yearBuilt : null, -1, -0.01, { cap: 1 }),
    0,
    100
  );

  // Cashflow risk heuristic: higher price/rent leads to higher risk
  const cashflowRisk = priceToRent ? clamp(normalize(priceToRent, 0.8, 100), 0, 100) : null;

  return { livability, efficiency, marketStrength, risk, lotAppeal, ageFactor, equityDelta, priceToRent, cashflowRisk };
}

function applyWeights(breakdown: ScoreBreakdown, context: ScoringContext, riskFlagsCount: number) {
  const { weights } = context;
  const weighted =
    breakdown.livability * weights.livability +
    breakdown.efficiency * weights.efficiency +
    breakdown.marketStrength * weights.marketStrength -
    breakdown.risk * weights.riskPenalty;

  const riskPenalty = Math.min(riskFlagsCount * 2.5, 15);
  return clamp(weighted - riskPenalty, 0, 100);
}

function buildValuation(property: PropertyRecord) {
  if (!property.sqft) return undefined;
  const multiplier = property.yearBuilt && property.yearBuilt > 2010 ? 335 : 305;
  return {
    estimate: Math.round(property.sqft * multiplier),
    currency: "USD",
    source: "heuristic",
  };
}

function buildRent(property: PropertyRecord) {
  if (!property.sqft) return undefined;
  const perK = property.beds && property.beds >= 3 ? 2300 : 2000;
  return {
    estimate: Math.round((property.sqft / 1000) * perK),
    currency: "USD",
    source: "heuristic",
  };
}

export function scoreProperty(property: PropertyRecord, weights?: Partial<ScoreWeights>, preset: ScorePreset = "normal"): { insight: PropertyInsight } {
  const context = buildContext(weights, preset);
  const breakdown = computeBreakdown(property, context);
  const riskFlags = buildRiskFlags(property);

  const score = applyWeights(breakdown, context, riskFlags.length);

  const valuation = buildValuation(property);
  const rentEstimate = buildRent(property);
  const taxonomy = property.lotSizeSqft && property.lotSizeSqft > 8000 ? "single-family" : "unknown";
  const confidenceScore = Math.max(40, 90 - riskFlags.length * 8);
  const qualityIndex = Math.max(30, 80 - riskFlags.length * 5);

  const insight: PropertyInsight = {
    score,
    breakdown,
    valuation,
    rentEstimate,
    summary: "Composite insight generated from property fundamentals, market signals, and heuristic risk weighting.",
    riskFlags,
    recommendations: [
      "Validate utilities and HVAC age during site visit.",
      "Capture exterior photos to refine curb appeal score.",
      "Confirm zoning/permit status for future work.",
      "Collect utility bills to refine efficiency score.",
    ],
    lastUpdated: new Date().toISOString(),
    source: "heuristic",
    scoreVersion: context.scoreVersion,
    confidenceScore,
    qualityIndex,
    taxonomy,
    trends: {
      valuation3mo: valuation?.estimate ? Math.round(valuation.estimate * 1.01) : null,
      valuation12mo: valuation?.estimate ? Math.round(valuation.estimate * 1.03) : null,
      rent3mo: rentEstimate?.estimate ? Math.round(rentEstimate.estimate * 1.01) : null,
      rent12mo: rentEstimate?.estimate ? Math.round(rentEstimate.estimate * 1.03) : null,
      risk3mo: Math.max(0, breakdown.risk - 1),
      risk12mo: Math.max(0, breakdown.risk - 3),
    },
  };

  return { insight };
}
