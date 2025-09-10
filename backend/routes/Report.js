const express = require("express");
const multer = require("multer");
const Report = require("../models/reports");
const router = express.Router();
const  { uploadImage , deleteImageFromCloudinary } = require("../utils/uploadImage.js");
const NagarPalika = require("../models/nagarPalica.js");


const { classifyDepartment, generateTextVector, generateImageVector } = require("../utils/ai");
const { cosineSimilarity, hasHospitalOrSchool } = require("../utils/helpers");
const Officer = require("../models/officer.js");

// Configure multer storage
const storage = multer.memoryStorage(); // keeps file in memory
const upload = multer({ storage: storage });

// CREATE REPORT
router.post("/:nagarId", upload.fields([{ name: "image" }]), async (req, res) => {
  try {
    const { reporterEmail, title, description, location } = req.body;
    const { image } = req.files || {};
    if (!reporterEmail || !title || !description || !location || !image) {
      return res.status(400).json({ error: "missing required Fields" });
    }

    const { nagarId } = req.params;
    const [lng, lat] = JSON.parse(location).coordinates;
    const department = await classifyDepartment(description);
    const descVector = await generateTextVector(description);
    let priority = 0;

    const { secure_url, public_id } = await uploadImage(
      `data:${image[0].mimetype};base64,${image[0].buffer.toString("base64")}`
    );

    // check duplicates
    const nearbyReports = await Report.find({
      nagarId,
      department,
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 200,
        },
      },
    });

    for (const candidate of nearbyReports) {
      if (!candidate.descriptionVector.length) continue;
      const descSim = cosineSimilarity(descVector, candidate.descriptionVector);
      if (descSim > 0.8) {
        await Report.findByIdAndUpdate(candidate._id, { $inc: { priority: 20 } });
        return res.json({ duplicateOf: candidate._id, message: "Duplicate report merged" });
      }
    }

    // importance check
    const nearImportant = await hasHospitalOrSchool(lat, lng);
    if (nearImportant) priority += 50;

    let givenOfficer = null;

    if (nearbyReports.length > 0) {
      givenOfficer = nearbyReports[0].assignedOfficer;
      priority = nearbyReports[0].priority;
    } else {
      const nagar = await NagarPalika.findOne({ nagarId }).populate(`${department}.officers`);
      const officers = nagar[department].officers;

      for (const officer of officers) {
        if (officer.status === "active") {
          givenOfficer = officer._id;
          await Officer.findByIdAndUpdate(officer._id, { status: "busy" });
          break;
        }
      }
    }

    // Create report
    const repId = (await Report.countDocuments()) + 1;
    const report = await Report.create({
      reporterEmail,
      title,
      description,
      imageUrl: secure_url,
      imageId: public_id,
      descriptionVector: descVector,
      priority,
      department,
      nagarId,
      location: JSON.parse(location),
      status: "submitted",
      reportId: `ISSUE-${repId}`,
      assignedOfficer: givenOfficer,
    });

    // if no officer → push into pendingReports of department
    if (!givenOfficer) {
      await NagarPalika.findOneAndUpdate(
        { nagarId },
        { $push: { [`${department}.pendingReports`]: report._id } }
      );
    } else {
      await Officer.findByIdAndUpdate(givenOfficer, {
        $push: { assignedReports: report._id },
      });
    }

    res.json({ success: true, reportId: report._id, message: "Report submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Report creation failed" });
  }
});


module.exports = router ;