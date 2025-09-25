import axios from "axios";
import { motion } from "framer-motion";
import { useState } from "react";
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function UserSelection() {
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchLocation() {
      try {
        // ✅ Check if location already saved in localStorage
        const nagarId = localStorage.getItem("nagarId");
        if (nagarId) return; // do nothing if already saved

        // ✅ Ask only if not saved
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (pos) => {
              try {
                const { latitude, longitude } = pos.coords;

                // Call backend to find nagarpalika
                const res = await axios.get(
                  `${import.meta.env.VITE_BACKEND_URL}/nagarpalika/find?lat=${latitude}&lng=${longitude}`
                );
                console.log("Backend response:2343", res.data);

                if (res.data ) {
                  // ✅ Save nagarId for future
                  localStorage.setItem("nagarId", res.data.nagarId);
                  localStorage.setItem("center" , JSON.stringify(res.data.center)) ; // arry of location like [10,10]
                  localStorage.setItem("myLocation" , JSON.stringify([latitude,longitude])) ; // arry of location like [10,10]
                }
              } catch (err) {
                console.error("API error:", err);
                setError("Failed to fetch NagarPalika info");
              }
            },
            (geoError) => {
              console.error("Geolocation error:", geoError);
              setError("Unable to fetch your location");
            },
            { enableHighAccuracy: true }
          );
        } else {
          setError("Geolocation not supported by this browser.");
        }
      } catch (err) {
        console.error("Unexpected error:", err);
        setError("Something went wrong while detecting location.");
      }
    }

    fetchLocation();
  }, []);




  const options = [
    { label: "Public", path: "/public" },
    { label: "Municipal Council", path: "/login" },
    { label: "State Govt.", path: "/state" },
  ];

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-r from-blue-100 via-purple-100 to-pink-100 px-5 py-3 ">
      {/* Title */}
      <motion.h1
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-4xl font-extrabold text-gray-800 mb-8 text-center"
      >
        Welcome to CivicConnect 🚀  
        <span className="block text-lg font-medium text-gray-600">
          Please select who you are
        </span>
      </motion.h1>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl mx-auto">
        {options.map((opt, i) => (
          <motion.div
            key={opt.label}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.2 }}
            className="bg-white rounded-2xl shadow-xl p-6 flex flex-col items-center justify-between hover:shadow-2xl transition-shadow cursor-pointer"
            onClick={() => navigate(opt.path)}
          >
            <h2 className="text-2xl font-bold text-gray-700 mb-4">{opt.label}</h2>
            <button className="px-6 py-2 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium shadow hover:from-indigo-600 hover:to-purple-600">
              Go →
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
