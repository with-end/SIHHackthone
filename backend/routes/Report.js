const express = require("express");
const multer = require("multer");
const Report = require("../models/reports");
const router = express.Router();
const  { uploadImage , deleteImageFromCloudinary } = require("../utils/uploadImage.js");
const NagarPalika = require("../models/nagarPalica.js");
const reportQueue = require("../jobs/queue.js") ;


const { classifyDepartment, generateTextVector, generateImageVector } = require("../utils/ai");
const { cosineSimilarity, hasHospitalOrSchool , sendMail } = require("../utils/helpers.js");
const Officer = require("../models/officer.js");


// Configure multer storage
const storage = multer.memoryStorage(); // keeps file in memory
const upload = multer({ storage: storage });

// CREATE REPORT
router.post("/:nagarId", upload.fields([{ name: "image" }]), async (req, res) => {
  try {
    let { reporterEmail, title, description, location } = req.body;
    const { image } = req.files || {};
    const { nagarId } = req.params;
    location = JSON.parse(location) ;

    if (!reporterEmail || !title || !description || !location || !image) {
      return res.status(200).json({ message : "missing field" });
    }

    // Upload image immediately (to avoid losing file if queue worker runs later)
    const { secure_url, public_id } = await uploadImage(
      `data:${image[0].mimetype};base64,${image[0].buffer.toString("base64")}`
    );

   const  imageUrl= secure_url ;
   const  imageId = public_id ;


    // Push into queue
    // await reportQueue.add({
    //   reporterEmail,
    //   title,
    //   description,
    //   location: JSON.parse(location),
    //   nagarId,
    //   imageUrl: secure_url,
    //   imageId: public_id,
    // });/
    
     const department = await classifyDepartment(description);
    
        if( department==="inValid"){
            return res.status(200).json({ message : "not" });
        }
        const descVector = await generateTextVector(description);
        let priority = 0;
    
        // Find nearby reports for duplicate check
        const [lng, lat] = location.coordinates;
        const nearbyReports = await Report.find({
          nagarId,
          department,
          location: {
            $near: { $geometry: { type: "Point", coordinates: [lng, lat] }, $maxDistance: 200 }
          }
        });
    
        // Duplicate check
        for (const candidate of nearbyReports) {
          if (!candidate.descriptionVector.length) continue;
          const descSim = cosineSimilarity(descVector, candidate.descriptionVector);
          if (descSim > 0.85) {
            await Report.findByIdAndUpdate(candidate._id, { $inc: { priority: 20 } });
            await sendMail(reporterEmail, "duplicate", candidate.reportId);
            return res.status(200).json({ message : "duplicate" });
          }
        }
    
        // Importance check (hospital/school)
        const nearImportant = await hasHospitalOrSchool(lat, lng);
        if (nearImportant) priority += 50;
    
        // Officer assignment
        let givenOfficer = null;
        const nagar = await NagarPalika.findOne({ nagarId }).populate(`${department}.officers`);
        const officers = nagar[department].officers;
        for (const officer of officers) {
          if (officer.status === "active") {
            givenOfficer = officer._id;
            await Officer.findByIdAndUpdate(officer._id, { status: "busy" });
            break;
          }
        }
    
        // Create new report
        const repId = (await Report.countDocuments()) + 1;
        const report = await Report.create({
          reporterEmail,
          title,
          description,
          imageUrl,
          imageId,
          descriptionVector: descVector,
          priority,
          department,
          nagarId,
          location,
          reportId: `ISSUE-${repId}`,
          assignedOfficer: givenOfficer
        });
    
        await sendMail(reporterEmail, "submitted", report.reportId);
    
        // Emit report to all connected clients
    
        // Update Officer/NagarPalika assignments
        if (!givenOfficer) {
          await NagarPalika.findOneAndUpdate(
            { nagarId },
            {
              $push: {
                [`${department}.pendingReports`]: report._id,
                [`${department}.reports`]: report._id
              },
              $inc: { [`${department}.stats.pending`]: 1 }
            }
          );
        } else {
          await Officer.findByIdAndUpdate(givenOfficer, { $push: { assignedReports: report._id } });
          await NagarPalika.findOneAndUpdate(
            { nagarId },
            {
              $push: { [`${department}.reports`]: report._id },
              $inc: { [`${department}.stats.pending`]: 1 }
            }
          );
        }
        const io = req.app.get("io") ;
        console.log("report:" , report ) ;
        io.emit("assigned", report);

   

    // Instant response (no blocking)
    res.status(200).json({
      success: true,
      message: "reportSubmitted"
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Report submission failed" });
  }
});





// for getting all the reports according to the nagarId 
router.get("/:nagarId", async (req, res) => {
  try {
    const { nagarId } = req.params;
    const reports = await Report.find({ nagarId , status: { $ne : "completed" } });
    const io = req.app.get("io");
    io.emit("nagarId", nagarId);
    res.json(reports);
  } catch (error) {
    console.error("Error fetching reports:", error);
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});




// to get the particuler report
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




// to get only completed reports
router.get("/com/completed", async (req, res) => {
  try {
    const { nagarId } = req.query;
    const reports = await Report.find({ nagarId, status: "completed" });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

 


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

    sendMail(report.reporterEmail, status, report.reportId);
    const io = req.app.get("io") ;
    io.emit("reportStatusChanged" , { report }) ; // notify all clients about status change
    
    res.json(report);
  } catch (err) {
    console.error(err);
    res.status(500).send(err.message);
  }
});



module.exports = router ;