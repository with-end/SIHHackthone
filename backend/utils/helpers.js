const axios = require("axios");


function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const normB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (normA * normB);
}




async function hasHospitalOrSchool(lat, lng) {
  const query = `
    [out:json];
    (
      node["amenity"="hospital"](around:500,${lat},${lng});
      node["amenity"="school"](around:500,${lat},${lng});
    );
    out 1;
  `;

  try {
    const res = await axios.get("https://overpass-api.de/api/interpreter", {
      params: { data: query }
    });
    return res.data.elements.length > 0;
  } catch (err) {
    console.error("OSM check failed:", err.message);
    return false;
  }
}

module.exports = {cosineSimilarity , hasHospitalOrSchool }
