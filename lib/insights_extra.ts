import { PropertyInsight, PropertyRecord } from "@/lib/types";

export function classifyTaxonomy(property: PropertyRecord): PropertyInsight["taxonomy"] {
  const sqft = property.sqft || 0;
  if ((property.address.line1 || "").toLowerCase().includes("apt")) return "condo";
  if (sqft > 4000) return "commercial";
  if ((property.beds || 0) > 4) return "multi-family";
  return "single-family";
}

export function generateNarrative(property: PropertyRecord, insight: PropertyInsight): string {
  const parts: string[] = [];
  if (insight.valuation?.estimate) {
    parts.push(`Estimated value around $${insight.valuation.estimate.toLocaleString()}.`);
  }
  if (insight.rentEstimate?.estimate) {
    parts.push(`Rent potential near $${insight.rentEstimate.estimate.toLocaleString()} per month.`);
  }
  const highRisk = insight.riskFlags.find((f) => f.severity === "high");
  if (highRisk) parts.push(`Key risk: ${highRisk.label}.`);
  else if (insight.riskFlags.length) parts.push("Moderate risks present; review before quoting.");
  else parts.push("No major risks detected.");
  return parts.join(" ");
}

export function computeConfidence(insight: PropertyInsight, provenance?: PropertyInsight["provenance"]): number {
  const sources = provenance?.sources?.length || 0;
  const penalty = (insight.riskFlags.length || 0) * 5;
  const base = 80 + sources * 5;
  return Math.max(0, Math.min(100, base - penalty));
}

export function computeQualityIndex(insight: PropertyInsight, provenance?: PropertyInsight["provenance"]): number {
  const coverage = ["valuation", "rentEstimate", "breakdown"].reduce((acc, key) => acc + ((insight as Record<string, unknown>)[key] ? 1 : 0), 0);
  const errors = provenance?.errors?.length || 0;
  const sources = provenance?.sources?.length || 0;
  return Math.max(0, Math.min(100, 70 + coverage * 10 + sources * 5 - errors * 10));
}

export function computeTrends(insight: PropertyInsight) {
  const val = insight.valuation?.estimate || 0;
  const rent = insight.rentEstimate?.estimate || 0;
  const risk = insight.breakdown.risk || 0;
  return {
    valuation3mo: val ? Math.round(val * 1.01) : null,
    valuation12mo: val ? Math.round(val * 1.03) : null,
    rent3mo: rent ? Math.round(rent * 1.01) : null,
    rent12mo: rent ? Math.round(rent * 1.03) : null,
    risk3mo: Math.max(0, risk - 1),
    risk12mo: Math.max(0, risk - 3),
  };
}

export function computeMistrustScore(provenance?: PropertyInsight["provenance"]): number {
  const errors = provenance?.errors?.length || 0;
  const providerErrors = Object.keys(provenance?.meta?.providerErrors || {}).length;
  return Math.min(100, (errors + providerErrors) * 10);
}

export function diffInsights(prev: PropertyInsight | null, current: PropertyInsight) {
  if (!prev) return { changes: [], increasedRisk: false };
  const changes: string[] = [];
  if (prev.score !== current.score) changes.push(`Score ${prev.score} → ${current.score}`);
  if ((prev.valuation?.estimate || 0) !== (current.valuation?.estimate || 0)) {
    changes.push(`Valuation ${prev.valuation?.estimate || 0} → ${current.valuation?.estimate || 0}`);
  }
  if ((prev.rentEstimate?.estimate || 0) !== (current.rentEstimate?.estimate || 0)) {
    changes.push(`Rent ${prev.rentEstimate?.estimate || 0} → ${current.rentEstimate?.estimate || 0}`);
  }
  const increasedRisk = (current.riskFlags || []).length > (prev.riskFlags || []).length;
  return { changes, increasedRisk };
}

export function smartHealthTimeline(insight: PropertyInsight) {
  return [
    { label: "Current score", value: insight.score },
    { label: "Risk", value: insight.breakdown.risk },
    { label: "Valuation", value: insight.valuation?.estimate || 0 },
    { label: "Rent", value: insight.rentEstimate?.estimate || 0 },
  ];
}
