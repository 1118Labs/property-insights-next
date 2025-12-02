export type SegmentationResult = {
  provider: string;
  confidence: number;
  areas: {
    vegetation: number;
    roof: number;
    concrete: number;
    water: number;
    canopy: number;
  };
};

function deriveCoverage(seed: number) {
  // deterministic pseudo-random coverage splits based on seed
  const vegetation = 0.25 + ((seed % 7) / 100);
  const roof = 0.22 + ((seed % 5) / 120);
  const concrete = 0.18 + ((seed % 3) / 150);
  const water = 0.03 + ((seed % 2) / 200);
  const canopy = 0.08 + ((seed % 4) / 140);
  const total = vegetation + roof + concrete + water + canopy;
  // normalize to 1.0
  return {
    vegetation: vegetation / total,
    roof: roof / total,
    concrete: concrete / total,
    water: water / total,
    canopy: canopy / total,
  };
}

export function segmentTile(tile?: Buffer | ArrayBuffer): SegmentationResult {
  let seed = 42;
  if (tile) {
    const view = tile instanceof Buffer ? tile : Buffer.from(tile as ArrayBuffer);
    seed = view.slice(0, 8).reduce((acc, cur) => acc + cur, 0);
  }
  const areas = deriveCoverage(seed);
  return {
    provider: "unknown",
    confidence: 60 + (seed % 10),
    areas,
  };
}

export function estimateSqftFromCoverage(coverage: number, zoom: number): number {
  // approximate meters per pixel for WebMercator
  const metersPerPixel = (156543.03392 * Math.cos(0)) / Math.pow(2, zoom);
  const sqftPerPixel = (metersPerPixel * metersPerPixel) * 10.7639;
  return Math.round(coverage * sqftPerPixel * 512 * 512);
}
