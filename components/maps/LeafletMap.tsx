"use client";

import { useMemo } from "react";
import {
  CircleMarker,
  MapContainer,
  TileLayer,
  Tooltip,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";

type LeafletMapProps = {
  lat: number;
  lng: number;
  zoom?: number;
};

export default function LeafletMap({ lat, lng, zoom = 15 }: LeafletMapProps) {
  const center = useMemo(() => [lat, lng] as [number, number], [lat, lng]);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      style={{ height: "100%", width: "100%" }}
      zoomControl={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <CircleMarker center={center} pathOptions={{ color: "#14D8FF" }} radius={10}>
        <Tooltip direction="top" offset={[0, -10]} opacity={0.9}>
          Property location
        </Tooltip>
      </CircleMarker>
    </MapContainer>
  );
}
