import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useTranslation } from "react-i18next";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { openDB } from "idb"; // for IndexedDB offline storage
import { v4 as uuidv4 } from "uuid";
import toast from 'react-hot-toast' ;

// Fix default icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// IndexedDB helpers
const DB_NAME = "reportsDB";
const STORE_NAME = "pendingReports";

async function getDB() {
  return openDB(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "reportId" });
      }
    },
  });
}

async function saveReportToDB(report) {
  const db = await getDB();
  await db.put(STORE_NAME, report);
}

// Location picker component
function LocationPicker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation([e.latlng.lat, e.latlng.lng]);
      console.log(e.latlng) ;
    },
  });
  return location ? <Marker position={location} /> : null;
}

export default function SubmitReport() {
  const { t , i18n } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const myLocation = JSON.parse(localStorage.getItem("myLocation")) ;
  const [location, setLocation] = useState(myLocation || null); // [lat, lng]
  const pos = JSON.parse(localStorage.getItem("center"));
  const [mapCenter, setMapCenter] = useState([pos[1], pos[0]]);
  const [loading, setLoading] = useState(false);
  const nagarId = localStorage.getItem("nagarId");
  const [email, setEmail] = useState(null);
  const mapRef = useRef(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Voice-to-text
  const handleSpeak = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert(t("speechNotSupported"));
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = `${i18n.language}-IN`;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.start();
    recognition.onresult = (event) => {
      const spokenText = event.results[0][0].transcript;
      setDescription(description + " " + spokenText);
    };
    recognition.onerror = (event) => {
      console.error("Speech recognition error:", event.error);
    };
  };

  // Upload image
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));
    }
  };

  // Capture image from camera
  const handleCapture = async () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(t("cameraNotSupported"));
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement("video");
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement("canvas");
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg"));
      const file = new File([blob], "capture.jpg", { type: "image/jpeg" });

      setImageFile(file);
      setImageUrl(URL.createObjectURL(file));

      stream.getTracks().forEach((track) => track.stop());
    } catch (err) {
      console.error("Camera error:", err);
      toast.success(t("cameraError"));
    }
  };

  // Auto location picker
  // useEffect(() => {
  //   if (!location && navigator.geolocation) {
  //     navigator.geolocation.getCurrentPosition(
  //       (pos) => {
  //         const lat = pos.coords.latitude;
  //         const lng = pos.coords.longitude;
  //         setLocation([lat, lng]);
  //         setMapCenter([lat, lng]);
  //       },
  //       (err) => {
  //         console.warn("Could not get location:", err.message);
  //       },
  //       { enableHighAccuracy: true }
  //     );
  //   }
  // }, []);

  // Convert file to base64
  const fileToBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });

  // Submit report with offline support
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return alert(t("selectLocation"));
    setLoading(true);

    const reportId = uuidv4(); // unique ID
    const report = {
      reportId,
      reporterEmail: email,
      nagarId,
      title,
      description,
      location: { type: "Point", coordinates: [location[1], location[0]] },
      status: "submitted",
    };

    if (imageFile) {
      report.imageBase64 = await fileToBase64(imageFile);
    }

    try {
      const formData = new FormData();
      formData.append("reporterEmail", report.reporterEmail);
      formData.append("title", report.title);
      formData.append("description", report.description);
      formData.append("location", JSON.stringify(report.location));
      if (imageFile) formData.append("image", imageFile);

      await axios.post(
        `${import.meta.env.VITE_BACKEND_URL}/reports/${nagarId}`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      toast.success(t("reportSubmitted"));
      navigate("/public");
    } catch (err) {
      console.warn("Offline or network issue, saving report locally.", err);
      await saveReportToDB(report);

      if ("serviceWorker" in navigator && "SyncManager" in window) {
        const reg = await navigator.serviceWorker.ready;
        await reg.sync.register("sync-reports");
        toast.success(t("reportOffline"));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 md:p-3 lg:p-4 flex flex-col md:flex-row gap-4">
      {/* Form */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 order-1 md:order-none">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
          {t("submitReport")}
        </h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder={t("title")}
            className="p-2 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <input
            type="email"
            placeholder={t("emailId")}
            className="p-2 border rounded-lg"
            value={email}
            inputMode="email"
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <textarea
            placeholder={t("description")}
            className="p-2 border rounded-lg"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleSpeak}
              className="flex-1 bg-blue-500 text-white py-2 rounded-lg hover:bg-blue-600 text-sm"
            >
              🎤 {t("speak")}
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="flex-1 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 text-sm"
            >
              📸 {t("capture")}
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 text-sm"
            >
              📁 {t("upload")}
            </button>
            <input
              type="file"
              accept="image/*"
              ref={fileInputRef}
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          {imageUrl && (
            <img
              src={imageUrl}
              alt="Preview"
              className="w-full h-40 object-cover rounded-lg"
            />
          )}

          <button
            type="submit"
            disabled={loading}
            className="bg-green-500 text-white py-2 rounded-xl hover:bg-green-600 font-semibold"
          >
            {loading ? t("submitting") : t("submitReport")}
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-2">{t("clickOnMap")}</p>
      </div>

      {/* Map */}
      <div className="w-full md:w-2/3 h-[60vh] md:h-[80vh] rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={7}
          className="w-full h-full z-0"
          whenCreated={(mapInstance) => {
            mapRef.current = mapInstance;
          }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <LocationPicker location={location} setLocation={setLocation} />
        </MapContainer>
      </div>
    </div>
  );
}
