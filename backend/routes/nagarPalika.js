const express = require("express");
const mongoose = require("mongoose");
const NagarPalika = require("../models/nagarPalica");
const Officer = require("../models/officer");

const router = express.Router();

// ----------------------
// GET ALL NAGARPALIKAS
// ----------------------
router.get("/", async (req, res) => {
  try {
    const nagarpalikas = await NagarPalika.find()
      .populate("mainOfficer", "name email") // only main officer name
      .select("name mainOfficer boundary"); // only return name + mainOfficer
  
    res.json(nagarpalikas);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});
// ----------------------
// ADD NEW NAGARPALIKA with officers
// ----------------------
router.post("/", async (req, res) => {
  try {
    const { name, boundary, mainOfficer } = req.body;

    // 1. Create main officer
    const main = new Officer({
      name: mainOfficer.name,
      email: mainOfficer.email,
      password: mainOfficer.password, // ⚠️ hash before save ideally
      role: "main",
    });
    await main.save();

    const nId = await NagarPalika.countDocuments() + 1 ;
    // 3. Create NagarPalika
    const newNP = new NagarPalika({
      name,
      boundary,
      mainOfficer: main._id,
      nagarId : `NP-${nId.toString()}` ,

    });

    await newNP.save();
    const populatedNP = await newNP.populate("mainOfficer", "name email");

// Optionally, pick only the fields you want
const result = {
  name: populatedNP.name,
  mainOfficer: populatedNP.mainOfficer,
  boundary: populatedNP.boundary ,
  _id : populatedNP._id ,
};

// Send JSON response
res.json(result);
    // 4. Populate officers info
    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// UPDATE NAGARPALIKA
// ----------------------
router.put("/:id", async (req, res) => {
  try {
    const { name, mainOfficerId, officerIds, boundary } = req.body;

    const np = await NagarPalika.findById(req.params.id);
    if (!np) return res.status(404).json({ error: "NagarPalika not found" });

    if (mainOfficerId) {
      const mainOfficer = await Officer.findById(mainOfficerId);
      if (!mainOfficer) return res.status(400).json({ error: "Main officer not found" });
      np.mainOfficer = mainOfficer._id;
    }

    if (name) np.name = name;
    if (boundary) np.boundary = boundary;
    if (officerIds) np.officers = officerIds;

    await np.save();

    const populatedNP = await np
      .populate("mainOfficer", "name email role")
      .populate("officers", "name email role");

    res.json(populatedNP);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// ----------------------
// DELETE NAGARPALIKA
// ----------------------
router.delete("/:id", async (req, res) => {
  try {
    const np = await NagarPalika.findByIdAndDelete(req.params.id);
    if (!np) return res.status(404).json({ error: "NagarPalika not found" });
    res.json({ message: "NagarPalika deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});



// get nagar palika by location of the user
// Helper function → Point in polygon check
function isPointInPolygon(point, polygon) {
  const [x, y] = point;
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i][0],
      yi = polygon[i][1];
    const xj = polygon[j][0],
      yj = polygon[j][1];

    const intersect =
      yi > y !== yj > y &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

    if (intersect) inside = !inside;
  }

  return inside;
}

// ✅ GET /api/nagarpalika/find?lat=..&lng=..--- for giving the nagar palikaId based on the location of the user 
router.get("/find", async (req, res) => {
  try {
    console.log("hellow") ;
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const nagars = await NagarPalika.find();
    const point = [parseFloat(lat), parseFloat(lng)];

    for (const nagar of nagars) {
      if (isPointInPolygon(point, nagar.boundary)) {
        return res.json(nagar.nagarId); // ✅ return the nagarpalika where point lies
      }
    }

    res.status(404).json({ message: "No NagarPalika found at this location" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


module.exports = router;
