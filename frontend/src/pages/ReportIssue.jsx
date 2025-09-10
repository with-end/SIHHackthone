import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import axios from "axios";


function LocationPicker({ location, setLocation }) {
  useMapEvents({
    click(e) {
      setLocation([e.latlng.lat, e.latlng.lng]);
    },
  });
  return location ? <Marker position={location} /> : null;
}

export default function SubmitReport() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");
  const [location, setLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState([23.2599, 77.4126]);
  const [loading, setLoading] = useState(false);
  const nagarId = localStorage.getItem("nagarId") ;

  const mapRef = useRef(null);
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  // Voice-to-text
  const handleSpeak = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Speech recognition not supported in this browser.");
      return;
    }
    const recognition = new window.webkitSpeechRecognition();
    recognition.lang = "en-US";
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
      alert("Camera not supported");
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
      alert("Failed to capture image");
    }
  };

  // Auto location picker
  useEffect(() => {
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = pos.coords.latitude;
          const lng = pos.coords.longitude;
          setLocation([lat, lng]);
          setMapCenter([lat, lng]);
        },
        (err) => {
          console.warn("Could not get location:", err.message);
        },
        { enableHighAccuracy: true }
      );
    }
  }, []);

  // Submit report
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!location) return alert("Please select a location on the map.");

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("reporterEmail", "user@example.com");
      formData.append("title", title);
      formData.append("description", description);
      formData.append(
        "location",
        JSON.stringify({ type: "Point", coordinates: [location[1], location[0]] })
      );
      if (imageFile) formData.append("image", imageFile);

      await axios.post(`${import.meta.env.VITE_BACKEND_URL}/reports/${nagarId}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      alert("Report submitted successfully.");
      navigate("/public");
    } catch (err) {
      console.error(err);
      alert("Failed to submit report.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-1 md:p-3 lg:p-4 flex flex-col md:flex-row gap-4">
      {/* Form first on mobile */}
      <div className="w-full md:w-1/3 flex flex-col gap-4 order-1 md:order-none">
        <h2 className="text-2xl font-bold bg-gradient-to-r from-indigo-500 via-pink-500 to-yellow-500 bg-clip-text text-transparent">
          Submit Report
        </h2>
        <form className="flex flex-col gap-3" onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Title"
            className="p-2 border rounded-lg"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea
            placeholder="Description"
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
              🎤 Speak
            </button>
            <button
              type="button"
              onClick={handleCapture}
              className="flex-1 bg-purple-500 text-white py-2 rounded-lg hover:bg-purple-600 text-sm"
            >
              📸 Capture
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current.click()}
              className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 text-sm"
            >
              📁 Upload
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
            {loading ? "Submitting..." : "Submit Report"}
          </button>
        </form>
        <p className="text-gray-500 text-sm mt-2">
          Click on the map to select the report location.
        </p>
      </div>

      {/* Map */}
      <div className="w-full md:w-2/3 h-[60vh] md:h-[80vh] rounded-xl overflow-hidden shadow-lg">
        <MapContainer
          center={mapCenter}
          zoom={16}
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
