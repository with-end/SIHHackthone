import { MapContainer, TileLayer, Polyline, Marker, Popup, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Custom colored marker icons
const redIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const greenIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const orangeIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// NagarPalika Building Icon
// NagarPalika Building Icon (flat symbol, not pin)
const buildingIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png", // 🏛️ building icon
  iconSize: [45, 45], // bigger for visibility
  iconAnchor: [22, 45], 
  popupAnchor: [0, -40],
});
// Point-in-Polygon check (Ray Casting)
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const [xi, yi] = polygon[i];
    const [xj, yj] = polygon[j];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }
  return inside;
}

// Handle clicks
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

export default function NagarPalikaMap() {
  // Dummy irregular boundary
  const nagarpalikaBoundary = [
    [26.860, 80.940],
    [26.865, 80.950],
    [26.862, 80.965],
    [26.855, 80.970],
    [26.848, 80.960],
    [26.845, 80.945],
    [26.850, 80.935],
    [26.857, 80.933],
    [26.860, 80.940],
  ];

  // Dummy issues with status
  const issues = [
    { lat: 26.855, lng: 80.945, title: "Pothole Issue", status: "Pending" },
    { lat: 26.852, lng: 80.955, title: "Garbage Dump", status: "In Progress" },
    { lat: 26.858, lng: 80.950, title: "Street Light Fixed", status: "Resolved" },
  ];

  // Dummy NagarPalika Building location (center of polygon)
  const nagarpalikaOffice = { lat: 26.855, lng: 80.950 };

  // Pick icon by status
  const getIconByStatus = (status) => {
    if (status === "Resolved") return greenIcon;
    if (status === "In Progress") return orangeIcon;
    return redIcon; // default for "Pending"
  };

  return (
    <div className="w-full h-screen">
      <MapContainer center={[26.855, 80.95]} zoom={14} className="w-full h-full">
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {/* NagarPalika border */}
        <Polyline positions={nagarpalikaBoundary} pathOptions={{ color: "red", weight: 3 }} />

        {/* NagarPalika Building */}
        <Marker position={[nagarpalikaOffice.lat, nagarpalikaOffice.lng]} icon={buildingIcon}>
          <Popup>
            🏛️ <b>NagarPalika Office</b>
          </Popup>
        </Marker>

        {/* Issue markers */}
        {issues.map((issue, i) => (
          <Marker
            key={i}
            position={[issue.lat, issue.lng]}
            icon={getIconByStatus(issue.status)}
          >
            <Popup>
              <b>{issue.title}</b> <br />
              Status: {issue.status}
            </Popup>
          </Marker>
        ))}

        <ClickHandler boundary={nagarpalikaBoundary} />
      </MapContainer>
    </div>
  );
}
