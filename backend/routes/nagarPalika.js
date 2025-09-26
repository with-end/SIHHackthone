const express = require("express");
const mongoose = require("mongoose");
const NagarPalika = require("../models/nagarPalica");
const Officer = require("../models/officer");
const Report = require("../models/reports.js") ;

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
    const { name, boundary, mainOfficer , office} = req.body;

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
      office 

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
    
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ error: "lat and lng required" });
    }

    const nagars = await NagarPalika.find();
    const point = [parseFloat(lat), parseFloat(lng)];

    for (const nagar of nagars) {
      if (isPointInPolygon(point, nagar.boundary)) {
        return res.json({nagarId : nagar.nagarId , center : nagar.office.coordinates}); // ✅ return the nagarpalika where point lies
      }
    }

    res.status(404).json({ message: "No NagarPalika found at this location" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/:nagarId/boundary", async (req, res) => {
  try {
    const nagar = await NagarPalika.findOne({ nagarId: req.params.nagarId });
    if (!nagar) return res.status(404).json({ error: "NagarPalika not found" });

    res.json({ boundary: nagar.boundary , location : nagar.office});
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch boundary" });
  }
});

// ✅ Get Reports for NagarPalika
router.get("/:nagarId/reports/:type", async (req, res) => {
  try {
    const { nagarId, type } = req.params;

    let query = { nagarId };

    if (type !== "office") {
      // filter by department if not "office"
      query.department = type;
    }

    const reports = await Report.find(query);
    res.json(reports);

    
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});



// for home page information 
router.get("/home/:variable", async (req, res) => {
  try {
    const { variable } = req.params; // "office" OR specific dept like "roads"
    const { nagarId } = req.query;

    if (!nagarId) {
      return res.status(400).json({ message: "nagarId is required" });
    }

    let reports = [];
    let statusCounts = {};
    let deptSummary = {};
    let trendData = {};

    // ✅ Fetch the NagarPalika
    const nagar = await NagarPalika.findOne({nagarId})
  .populate("roads.reports")
  .populate("electricity.reports")
  .populate("sanitation.reports")
  .populate("water.reports")
  .populate("others.reports");
    if (!nagar) return res.status(404).json({ message: "NagarPalika not found" });

    // ---- CASE 1: OFFICE (all depts combined) ----
    if (variable === "office") {
      // Collect all reports from all departments
      const allDepts = ["roads", "electricity", "sanitation", "water", "others"];

      for (const deptName of allDepts) {
        const dept = nagar[deptName];
        if (!dept) continue;

        // Gather reports
        reports = reports.concat(dept.reports || []);

        // Department summary (for left chart)
        deptSummary[deptName] = {
          name: deptName,
          pending:
            (dept.stats?.pending || 0) +
            (dept.stats?.inprogress || 0) +
            (dept.stats?.approved || 0),
          resolved : dept.stats?.completed ,
        };

        // Add to overall status counts
        statusCounts.pending = (statusCounts.pending || 0) + (dept.stats?.pending || 0);
        statusCounts["inprogress"] = (statusCounts["inprogress"] || 0) + (dept.stats?.inprogress || 0);
        statusCounts.completed = (statusCounts.completed || 0) + (dept.stats?.completed || 0);
        statusCounts.approved = (statusCounts.approved || 0) + (dept.stats?.approved || 0);
        statusCounts.rejected = (statusCounts.rejected || 0) + (dept.stats?.rejected || 0);
      }
    } 
    
    // ---- CASE 2: SPECIFIC DEPARTMENT ----
    else {
      const dept = nagar[variable];
      if (!dept) return res.status(404).json({ message: "Department not found" });

      reports = dept.reports || [];
      statusCounts = {
        pending: dept.stats?.pending || 0,
        "inprogress": dept.stats?.inprogress || 0,
        completed: dept.stats?.completed || 0,
        approved: dept.stats?.approved || 0,
        rejected: dept.stats?.rejected || 0,
      };
    }

    // ---- TREND DATA: Last 6 months ----
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 5); // include current month

    const trendQuery =
      variable === "office"
        ? { nagarId, submissionDate: { $gte: sixMonthsAgo } }
        : { nagarId, department: variable, submissionDate: { $gte: sixMonthsAgo } };

    const trend = await Report.aggregate([
      { $match: trendQuery },
      {
        $group: {
          _id: {
            year: { $year: "$submissionDate" },
            month: { $month: "$submissionDate" },
          },
          newIssues: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ["$status", ["completed", "approved"]] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    // Format trend for frontend
    const monthNames = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
    trendData = trend.reduce((acc, t) => {
      const label = `${monthNames[t._id.month - 1]} ${t._id.year}`;
      acc[label] = { new: t.newIssues, completed: t.resolved };
      return acc;
    }, {});

    res.json({ reports, statusCounts, deptSummary, trendData });
  } catch (err) {
    console.error("Error in /home/:variable:", err);
    res.status(500).json({ message: "Server error" });
  }
});




module.exports = router;
