import { NextResponse } from "next/server";
import { fetchTile } from "@/lib/mapper.engine";
import { createCorrelationId, jsonError } from "@/lib/utils/api";

export async function GET(req: Request) {
  const correlationId = createCorrelationId();
  try {
    const url = new URL(req.url);
    const lat = Number(url.searchParams.get("lat"));
    const lon = Number(url.searchParams.get("lon"));
    const zoom = Number(url.searchParams.get("zoom") || 17);
    const size = Number(url.searchParams.get("size") || 512);
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
      return jsonError(400, { errorCode: "INVALID_INPUT", message: "lat/lon required", correlationId });
    }
    const result = await fetchTile({ lat, lon, zoom, size });
    const body = result.data instanceof Buffer ? new Uint8Array(result.data) : result.data;
    return new NextResponse(body as BodyInit, {
      status: 200,
      headers: {
        "Content-Type": "image/png",
        "x-provider": result.provider,
        "x-correlation-id": correlationId,
      },
    });
  } catch (err) {
    return jsonError(500, { errorCode: "SERVER_ERROR", message: String(err), correlationId });
  }
}
