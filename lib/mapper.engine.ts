import { recordProviderMetric } from "@/lib/utils/telemetry";

export type TileRequest = { lat: number; lon: number; zoom: number; size: number };
export type TileResult = { data: Buffer; provider: string };

const tileCache = new Map<string, { data: Buffer; provider: string; expires: number }>();
const TTL = 5 * 60 * 1000;

function cacheKey(req: TileRequest) {
  return `${req.lat}:${req.lon}:${req.zoom}:${req.size}`;
}

function isAppleConfigured() {
  return Boolean(process.env.APPLE_MAPS_JWT || (process.env.APPLE_MAPS_TEAM_ID && process.env.APPLE_MAPS_KEY_ID && process.env.APPLE_MAPS_PRIVATE_KEY));
}

export async function fetchTile(req: TileRequest): Promise<TileResult> {
  const key = cacheKey(req);
  const cached = tileCache.get(key);
  if (cached && cached.expires > Date.now()) return cached;

  const providers = ["apple", "osm", "esri", "naip"] as const;
  for (const provider of providers) {
    try {
      const res = await getFromProvider(provider, req);
      if (res) {
        tileCache.set(key, { ...res, expires: Date.now() + TTL });
        recordProviderMetric(`tile.${provider}`, 10, false);
        return res;
      }
    } catch (err) {
      recordProviderMetric(`tile.${provider}`, 0, true, String(err));
      continue;
    }
  }
  // fallback: 1x1 transparent PNG
  const data = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8Xw8AApMBgQZ0pQkAAAAASUVORK5CYII=", "base64");
  return { data, provider: "fallback" };
}

async function getFromProvider(provider: "apple" | "osm" | "esri" | "naip", req: TileRequest): Promise<TileResult | null> {
  const tileUrl = buildUrl(provider, req);
  if (!tileUrl) return null;
  const resp = await fetch(tileUrl);
  if (!resp.ok) return null;
  const arrayBuffer = await resp.arrayBuffer();
  return { data: Buffer.from(arrayBuffer), provider };
}

function buildUrl(provider: "apple" | "osm" | "esri" | "naip", req: TileRequest) {
  const { lat, lon, zoom, size } = req;
  if (provider === "apple") {
    if (!isAppleConfigured()) return null;
    // Placeholder: MapKit static maps not directly public; would use token + style params.
    return `https://maps.apple.com/staticmap?center=${lat},${lon}&z=${zoom}&size=${size}x${size}&lang=en`;
  }
  if (provider === "osm") {
    const x = lon2tile(lon, zoom);
    const y = lat2tile(lat, zoom);
    return `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`;
  }
  if (provider === "esri") {
    return `https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/${zoom}/${lat2tile(lat, zoom)}/${lon2tile(lon, zoom)}`;
  }
  if (provider === "naip") {
    return `https://naip.maptiles.arcgis.com/arcgis/rest/services/NAIP/MapServer/tile/${zoom}/${lat2tile(lat, zoom)}/${lon2tile(lon, zoom)}`;
  }
  return null;
}

function lon2tile(lon: number, zoom: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, zoom));
}
function lat2tile(lat: number, zoom: number) {
  return Math.floor(
    ((1 - Math.log(Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)) / Math.PI) / 2) *
      Math.pow(2, zoom)
  );
}
