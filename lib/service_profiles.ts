import { AerialInsight, PropertyInsight, PropertyRecord, ServiceProfileType } from "@/lib/types";

export type ServiceInsight = {
  profile: ServiceProfileType;
  details: Record<string, unknown>;
  warnings: string[];
  confidence: number;
};

function clamp(num: number, min: number, max: number) {
  return Math.max(min, Math.min(max, num));
}

export function resolveActiveProfiles(profile?: ServiceProfileType): ServiceProfileType[] {
  return profile ? [profile] : ["cleaning"];
}

export function generateServiceInsight(
  profile: ServiceProfileType,
  property: PropertyRecord,
  core: PropertyInsight,
  provenanceWarnings: string[] = [],
  aerial?: AerialInsight
): ServiceInsight {
  const details: Record<string, unknown> = {};
  const warnings: string[] = [...provenanceWarnings];

  const sqft = property.sqft || 1500;
  const lot = property.lotSizeSqft || 6000;
  const beds = property.beds || 3;
  const baths = property.baths || 2;

  switch (profile) {
    case "cleaning": {
      const complexity = beds * 2 + baths * 3;
      details.squareFootage = sqft;
      details.complexityScore = complexity;
      details.clutterHeuristic = sqft > 2500 ? "medium" : "low";
      break;
    }
    case "lawncare": {
      const yard = aerial?.yardSqft ?? lot;
      details.yardSize = yard;
      details.edgingFeet = Math.round(Math.sqrt(yard) * 4);
      details.treeDensity = aerial?.treeDensity ?? (yard > 8000 ? "medium" : "low");
      details.surfaceMix = { lawn: clamp(yard * 0.7, 0, yard), driveway: clamp(yard * 0.3, 0, yard) };
      break;
    }
    case "roofing": {
      const roofArea = Math.round((aerial?.roofSqft || lot) * 1.2);
      details.roofArea = roofArea;
      details.pitch = property.yearBuilt && property.yearBuilt < 1980 ? "steep" : "moderate";
      details.materialGuess = "shingle";
      break;
    }
    case "painting": {
      const stories = property.yearBuilt && property.yearBuilt < 1960 ? 2 : 1;
      const perimeter = Math.round(Math.sqrt(lot) * 4);
      details.sidingArea = perimeter * stories * 10;
      details.trimComplexity = beds > 3 ? "medium" : "low";
      details.scope = "exterior";
      break;
    }
    case "pressure_washing": {
      const drive = aerial?.drivewaySqft ?? lot * 0.25;
      details.drivewayArea = clamp(drive, 200, lot);
      details.walkwayLength = Math.round(Math.sqrt(lot));
      details.sidingComplexity = beds > 3 ? "medium" : "low";
      break;
    }
    case "window_washing": {
      const stories = property.yearBuilt && property.yearBuilt < 1960 ? 2 : 1;
      details.windowCount = beds * 3 + baths + stories * 4;
      details.accessDifficulty = stories > 1 ? "ladder" : "easy";
      break;
    }
    case "gutter_cleaning": {
      const perimeter = Math.round(Math.sqrt(lot) * 4);
      details.linearFootage = perimeter;
      details.exposure = property.yearBuilt && property.yearBuilt < 1980 ? "weathered" : "standard";
      break;
    }
    case "snow_removal": {
      const drive = aerial?.drivewaySqft ?? lot * 0.3;
      details.drivewayArea = clamp(drive, 300, lot);
      details.walkDistance = Math.round(Math.sqrt(lot) / 2);
      details.frontage = Math.round(Math.sqrt(lot));
      break;
    }
    case "pool_service": {
      details.poolPresent = aerial?.poolDetected ?? (property.address.line1 || "").toLowerCase().includes("pool") ? true : false;
      details.poolType = aerial?.poolShape || "in-ground";
      break;
    }
    default:
      break;
  }

  if (!property.lotSizeSqft) warnings.push("Lot size missing, estimates approximate");
  const confidence = clamp(80 - warnings.length * 10, 20, 95);

  return { profile, details, warnings, confidence };
}
