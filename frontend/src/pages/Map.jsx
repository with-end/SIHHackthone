// src/pages/Map.jsx
import React, { useEffect } from "react";
import { MapContainer, TileLayer, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import "leaflet.heat";

// Component to render masked heatmap
function MaskedHeatmap({ points, boundary }) {
  const map = useMap();

  useEffect(() => {
    // Create a heat layer with red points
    const heat = L.heatLayer(points, {
      radius: 25,
      blur: 15,
      gradient: { 0.4: "red", 0.65: "red", 1: "red" },
    }).addTo(map);

    // Create a polygon layer for masking
    const polygon = L.polygon(boundary);

    // Override draw to clip heatmap within polygon
    heat.on("tileload", (e) => {
      const ctx = e.tile.getContext("2d");
      ctx.save();
      const canvas = e.tile;
      const tileBounds = e.coords;
      const path = new Path2D();
      polygon.getLatLngs()[0].forEach(([lat, lng], idx) => {
        const point = map.latLngToContainerPoint([lat, lng]);
        if (idx === 0) path.moveTo(point.x, point.y);
        else path.lineTo(point.x, point.y);
      });
      path.closePath();
      ctx.globalCompositeOperation = "destination-in";
      ctx.fillStyle = "black";
      ctx.fill(path);
      ctx.restore();
    });

    return () => {
      map.removeLayer(heat);
    };
  }, [points, boundary, map]);

  return null;
}

export default function NagarPalikaHeatmap() {
  // Example Nagar Palika polygon
  const nagarPalikaBoundary = [
    [28.7041, 77.1025],
    [28.7141, 77.1125],
    [28.7241, 77.1025],
    [28.7141, 77.0925],
  ];

  // Random points inside approximate bounding box
  const points = Array.from({ length: 200 }, () => [
    28.7041 + Math.random() * 0.02,
    77.0925 + Math.random() * 0.02,
    0.5, // intensity
  ]);

  return (
    <MapContainer
      center={[28.7091, 77.1075]}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution="&copy; OpenStreetMap contributors"
      />

      <Polygon
        positions={nagarPalikaBoundary}
        pathOptions={{
          color: "green",
          fillColor: "transparent",
          fillOpacity: 0.1,
        }}
      />

      <MaskedHeatmap points={points} boundary={nagarPalikaBoundary} />
    </MapContainer>
  );
}
