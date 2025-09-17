const express = require("express");
const multer = require("multer");
const Report = require("../models/reports");
const router = express.Router();
const  { uploadImage , deleteImageFromCloudinary } = require("../utils/uploadImage.js");
const NagarPalika = require("../models/nagarPalica.js");


const { classifyDepartment, generateTextVector, generateImageVector } = require("../utils/ai");
const { cosineSimilarity, hasHospitalOrSchool , sendMail } = require("../utils/helpers.js");
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
          $maxDistance: 800,
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
      reportId: `ISSUE-${repId}`,
      assignedOfficer: givenOfficer,
    });
    console.log(reporterEmail , report.reportId)
    sendMail(reporterEmail , "submitted" , report.reportId ) ;

    // if no officer → push into pendingReports of department
    if (!givenOfficer) {
      await NagarPalika.findOneAndUpdate(
        { nagarId },
        { $push: { [`${department}.pendingReports`]: report._id ,  [`${department}.reports`]: report._id } ,  $inc: { [`${department}.stats.pending`]: 1 }}
      );
    } else {
      await Officer.findByIdAndUpdate(givenOfficer, {
        $push: { assignedReports: report._id },
      });
      await NagarPalika.findOneAndUpdate(
        { nagarId },
        { $push: { [`${department}.reports`]: report._id } , $inc: { [`${department}.stats.pending`]: 1 } }
      );
    }

    res.json({ success: true, reportId: report._id, message: "Report submitted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Report creation failed" });
  }
});

// for getting all the reports according to the nagarId 

router.get("/:nagarId", async (req, res) => {
  try {
    const { nagarId } = req.params;
    const reports = await Report.find({ nagarId });
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});


router.get("/rep/:reportId", async (req, res) => {
  try {
    const { reportId } = req.params;
    const { nagarId } = req.query;
    const report = await Report.findOne({ reportId, nagarId });
    if (!report) return res.status(404).json(null);
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


router.get("/com/completed", async (req, res) => {
  try {
    const { nagarId } = req.query;
    const reports = await Report.find({ nagarId, status: "completed" });
    console.log(reports) ;
    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// CHANGING THE STATUS OF THE REPORTS 
// CHANGING THE STATUS OF THE REPORTS 
router.patch("/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const report = await Report.findById(id);
    if (!report) return res.status(404).send("Report not found");

    const nagar = await NagarPalika.findOne({ nagarId: report.nagarId });
    if (!nagar) return res.status(404).send("NagarPalika not found");

    const department = report.department; // e.g. "roads", "water", etc.
    const prevStatus = report.status;

    // 1. Update the report document
    report.status = status;

    // set/update dates
    if (status === "approved") {
      report.approvalDate = new Date();
    }
    if (status === "completed") {
      report.completionDate = new Date();
    }
    if (status === "inprogress") {
      report.inprogressDate = new Date() ;
      // optional: you could add report.inProgressDate = new Date();
    }

    await report.save();

    // 2. Build update operations for NagarPalika
    const updateOps = { $inc: {}, $pull: {}, $push: {} };

    // decrement old status
    if (prevStatus) {
      updateOps.$inc[`${department}.stats.${prevStatus.toLowerCase()}`] = -1;
    }

    // increment new status
    updateOps.$inc[`${department}.stats.${status.toLowerCase()}`] = 1;

    // handle pendingReports array
    if (prevStatus === "pending") {
      updateOps.$pull[`${department}.pendingReports`] = report._id;
    }
    if (status === "pending") {
      updateOps.$push[`${department}.pendingReports`] = report._id;
    }

    // cleanup: remove empty operators (MongoDB will error if $push/$pull is empty)
    if (!Object.keys(updateOps.$inc).length) delete updateOps.$inc;
    if (!Object.keys(updateOps.$pull).length) delete updateOps.$pull;
    if (!Object.keys(updateOps.$push).length) delete updateOps.$push;

    // 3. Apply the update atomically
    await NagarPalika.findOneAndUpdate({ nagarId: report.nagarId }, updateOps);

    // sendMail(report.reporterEmail, status, report.reportId);

    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});



module.exports = router ;