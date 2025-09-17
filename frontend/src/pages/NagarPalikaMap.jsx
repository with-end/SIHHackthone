import { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useParams } from "react-router-dom";

// --- your marker icons (same as before) ---
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});
const buildingIcon = new L.Icon({ iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", iconSize: [45, 45], iconAnchor: [22, 45], popupAnchor: [0, -40] });

// --- point-in-polygon check ---
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];
    const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}

function ClickHandler({ boundary }) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      const inside = isPointInPolygon([lat, lng], boundary);
      if (inside) {
        alert(`✅ This point (${lat.toFixed(4)}, ${lng.toFixed(4)}) is INSIDE NagarPalika`);
      } else {
        alert(`❌ This point (${lat.toFixed(4)}, ${lng.toFixed(4)}) is OUTSIDE NagarPalika`);
      }
    },
  });
  return null;
}

export default function NagarPalikaMap({mode}) {
  const nagarId = localStorage.getItem("nagarId");
  let type = "office" ;
  if( mode=="department"){
    const { deptId } = useParams() ;
    type = deptId ;
  }
  const [boundary, setBoundary] = useState([]);
  const [reports, setReports] = useState([]);
  const pos = JSON.parse(localStorage.getItem("center"))
  const [center, setCenter] = useState([pos[1],pos[0]]); // fallback default

  useEffect(() => {
    const fetchData = async () => {
      try {
        const boundaryRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/nagarpalika/${nagarId}/boundary`);
        setBoundary(boundaryRes.data.boundary); // for boundry and location 

        // if (boundaryRes.data.boundary.length > 0) {
        //   setCenter(boundaryRes.data.boundary[0]); // roughly first point as center
        // }
         console.log(type , mode ) ;
        const reportsRes = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/nagarpalika/${nagarId}/reports/${type}`);
        console.log(reportsRes) ;
        setReports(reportsRes.data);
      } catch (err) {
        console.error("Failed to load data:", err);
      }
    };

    fetchData();
  }, [nagarId]);

  const getIconByStatus = (status) => {
    if (status === "completed") return greenIcon;
    if (status === "inprogress") return orangeIcon;
    return redIcon;
  };

  return (
    <div className="w-full h-screen">
      <MapContainer center={center} zoom={7} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* Boundary */}
        {boundary.length > 0 && (
          <Polyline positions={[...boundary, boundary[0]]}  pathOptions={{ color: "red", weight: 3 }} />
        )}

        {/* NagarPalika Building */}
        {boundary.length > 0 && (
          <Marker position={center} icon={buildingIcon}>
            <Popup>🏛️ <b>NagarPalika Office</b></Popup>
          </Marker>
        )}

        {/* Issue markers */}
        {reports.map((issue, i) => (
          <Marker
            key={i}
            position={[issue.location.coordinates[1], issue.location.coordinates[0]]} // [lat,lng]
            icon={getIconByStatus(issue.status)}
          >
            <Popup>
              <b>{issue.title}</b> <br />
              Status: {issue.status}
            </Popup>
          </Marker>
        ))}

        {boundary.length > 0 && <ClickHandler boundary={boundary} />}
      </MapContainer>
    </div>
  );
}
