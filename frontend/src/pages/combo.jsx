import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { MapContainer, TileLayer, Polygon, Popup, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import axios from "axios";


// 🟢 Marker Icon for office location
const officeIcon = new L.Icon({
  iconUrl: "https://cdn-icons-png.flaticon.com/512/684/684908.png",
  iconSize: [40, 40],
  iconAnchor: [20, 40],
  popupAnchor: [0, -35],
});

// Component to draw polygon for boundary
function PolygonDrawer({ boundary, setBoundary }) {
  useMapEvents({
    click(e) {
      setBoundary([...boundary, [e.latlng.lat, e.latlng.lng]]);
    },
  });
  return boundary.length ? <Polygon positions={boundary} pathOptions={{ color: "green" }} /> : null;
}

// Component to pick office location
function OfficeLocationPicker({ officeLocation, setOfficeLocation }) {
  useMapEvents({
    contextmenu(e) {
      // 👉 right-click to set office location
      setOfficeLocation([e.latlng.lat, e.latlng.lng]);
    },
  });

  return officeLocation ? (
    <Marker position={officeLocation} icon={officeIcon}>
      <Popup>🏛️ Municipal Council</Popup>
    </Marker>
  ) : null;
}

export default function CombinedNagarPalikaPage() {
  const [searchParams] = useSearchParams();
  const npId = searchParams.get("id");

  const [nagarpalikas, setNagarpalikas] = useState([]);
  const [colors, setColors] = useState({});
  const [name, setName] = useState("");
  const [boundary, setBoundary] = useState([]);
  const [officeLocation, setOfficeLocation] = useState(null);
  const [mainOfficer, setMainOfficer] = useState({ name: "", email: "", password: "" });
  const [showForm, setShowForm] = useState(false);

  const navigate = useNavigate();

  const generateColor = () => "#" + Math.floor(Math.random() * 16777215).toString(16);

  // Fetch all nagarpalikas
  const fetchNagarPalikas = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_BACKEND_URL}/nagarpalika`); 

      const newColors = { ...colors };
      res.data.forEach((np) => {
        if (!newColors[np._id]) {
          newColors[np._id] = generateColor();
        }
      });

      setColors(newColors);
      setNagarpalikas(res.data);

      if (npId) {
        const editing = res.data.find((np) => np._id === npId);
        if (editing) {
          setName(editing.name);
          setBoundary(editing.boundary || []);
          setOfficeLocation(
            editing.officeLocation?.coordinates
              ? [editing.officeLocation.coordinates[1], editing.officeLocation.coordinates[0]]
              : null
          );
          setMainOfficer(editing.mainOfficer || { name: "", email: "", password: "" });
          setShowForm(true);
        }
      }
    } catch (err) {
      console.error(err);
      alert("Failed to fetch Municipal Councils");
    }
  };

  useEffect(() => {
    fetchNagarPalikas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [npId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const body = {
        name,
        boundary,
        mainOfficer,
        office : officeLocation
          ? { type: "Point", coordinates: [officeLocation[1], officeLocation[0]] } // [lng, lat]
          : null,
      };

      if (npId) {
        await axios.put(`${import.meta.env.VITE_BACKEND_URL}/nagarpalika/${npId}`, body);
      } else {
        const res = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/nagarpalika`, body);
        setNagarpalikas((prev) => [...prev, res.data]);
        setColors((prev) => ({ ...prev, [res.data._id]: generateColor() }));
      }

      setShowForm(false);
      setName("");
      setBoundary([]);
      setOfficeLocation(null);
      setMainOfficer({ name: "", email: "", password: "" });
    } catch (err) {
      console.error(err);
      alert("Operation failed");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this Municipal Councipal")) return;
    try {
      await axios.delete(`${import.meta.env.VITE_BACKEND_URL}/nagarpalika/${id}`);
      setNagarpalikas((prev) => prev.filter((np) => np._id !== id));
      setColors((prevColors) => {
        const { [id]: _, ...rest } = prevColors;
        return rest;
      });
    } catch (err) {
      console.error(err);
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6 flex flex-col md:flex-row gap-6 bg-gray-50 min-h-screen">
      {/* Map Section */}
      <div className="md:w-2/3 h-[95vh] rounded-2xl overflow-hidden shadow-2xl border border-gray-200">
        <MapContainer center={[22.72, 75.87]} zoom={6} className="w-full h-full">
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* Show existing nagarpalikas */}
          {nagarpalikas.map((np) => (
            <>
              <Polygon
                key={np._id}
                positions={np.boundary}
                pathOptions={{ color: colors[np._id], fillOpacity: 0.3 }}
              >
                <Popup>
                  <div className="flex flex-col gap-1 text-sm">
                    <strong className="text-blue-600 text-base">{np.name}</strong>
                    <p className="text-gray-700">Main Officer: {np.mainOfficer?.name}</p>
                  </div>
                </Popup>
              </Polygon>

              {np.officeLocation?.coordinates && (
                <Marker
                  position={[np.officeLocation.coordinates[1], np.officeLocation.coordinates[0]]}
                  icon={officeIcon}
                >
                  <Popup>🏛️ {np.name} Office</Popup>
                </Marker>
              )}
            </>
          ))}

          {/* New/editing boundary */}
          <PolygonDrawer boundary={boundary} setBoundary={setBoundary} />

          {/* New/editing office location */}
          <OfficeLocationPicker officeLocation={officeLocation} setOfficeLocation={setOfficeLocation} />
        </MapContainer>
      </div>

      {/* Sidebar Section */}
      <div className="md:w-1/3 flex flex-col gap-4 bg-white p-6 rounded-2xl shadow-lg border border-gray-200">
        <button
          onClick={() => {
            setName("");
            setBoundary([]);
            setOfficeLocation(null);
            setMainOfficer({ name: "", email: "", password: "" });
            setShowForm(!showForm);
            navigate("");
          }}
          className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 transition font-semibold shadow"
        >
          ➕ Add New MunicipalCouncil
        </button>

        {showForm && (
          <>
            <h2 className="text-2xl font-bold text-gray-800">{npId ? "Update" : "Add"} NagarPalika</h2>
            <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
              <input
                type="text"
                placeholder="NagarPalika Name"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />

              <h3 className="font-semibold text-gray-700">Main Officer</h3>
              <input
                type="text"
                placeholder="Name"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                value={mainOfficer.name}
                onChange={(e) => setMainOfficer({ ...mainOfficer, name: e.target.value })}
                required
              />
              <input
                type="email"
                placeholder="Email"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                value={mainOfficer.email}
                onChange={(e) => setMainOfficer({ ...mainOfficer, email: e.target.value })}
                required
              />
              <input
                type="password"
                placeholder="Password"
                className="p-3 border rounded-lg focus:ring-2 focus:ring-green-400 outline-none"
                value={mainOfficer.password}
                onChange={(e) => setMainOfficer({ ...mainOfficer, password: e.target.value })}
                required
              />

              <button
                type="submit"
                className="bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 font-semibold shadow-md transition"
              >
                {npId ? "Update" : "Add"} NagarPalika
              </button>
            </form>

            <p className="text-gray-500 text-sm mt-2">
              📌 Click on the map to add boundary points. <br />
              📍 Right-click to set the **Office Location**.
            </p>
          </>
        )}

        {/* List of NagarPalikas */}
        <div className="mt-4 flex flex-col gap-3 overflow-y-auto max-h-[80vh]">
          {nagarpalikas.map((np) => (
            <div
              key={np._id}
              className="border border-gray-200 bg-white p-3 rounded-lg shadow flex flex-col gap-1"
            >
              <div className="flex items-center gap-2">
                <span
                  className="w-4 h-4 rounded-full"
                  style={{ backgroundColor: colors[np._id] }}
                ></span>
                <h3
                  className="font-bold text-gray-800 cursor-pointer hover:text-blue-600"
                  onClick={() => navigate(`?id=${np._id}`)}
                >
                  {np.name}
                </h3>
              </div>
              <p className="text-gray-700 text-left">
                <b>Main Officer:</b> {np.mainOfficer?.name}
              </p>
              <p className="text-gray-700 text-left">
                <b>Main OfficerId:</b> {np.mainOfficer?.email}
              </p>
              <div className="flex gap-2 mt-1">
                <button
                  onClick={() => navigate(`?id=${np._id}`)}
                  className="bg-blue-500 text-white py-1 px-3 rounded-lg shadow hover:bg-blue-600 transition"
                >
                  Update
                </button>
                <button
                  onClick={() => handleDelete(np._id)}
                  className="bg-red-500 text-white py-1 px-3 rounded-lg shadow hover:bg-red-600 transition"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
