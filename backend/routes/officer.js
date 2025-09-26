const express = require("express");
const Officer = require("../models/officer.js");
const Report = require("../models/reports.js");
const NagarPalika = require("../models/nagarPalica.js");

const officerRouter = express.Router();

// Get all assigned reports for officer
officerRouter.get("/:officerId/reports", async (req, res) => {
  try {
    // Find the officer first
    const officer = await Officer.findById(req.params.officerId);
    if (!officer) return res.status(404).json({ error: "Officer not found" });

    // Only fetch reports that are currently assigned to this officer
    const reports = await Report.find({ _id: { $in: officer.assignedReports } });

    res.json(reports);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch reports" });
  }
});


// Update officer status
officerRouter.post("/:officerId/status", async (req, res) => {
  try {
    const { status } = req.body;
    const officer = await Officer.findByIdAndUpdate(req.params.officerId, { status }, { new: true });
    console.log(status , officer) ;
    if (status === "active") {
      // find pending reports from officer’s department
      const nagar = await NagarPalika.findOne({ nagarId : officer.nagarId }) ;
      const deptKey = officer.department ; 

      if (deptKey) {
        const pendingReports = nagar[deptKey].pendingReports.splice(0, 3); // assign first 3
        for (let repId of pendingReports) {
          await Report.findByIdAndUpdate(repId, { assignedOfficer: officer._id });
          officer.assignedReports.push(repId);
        }
        await nagar.save();
        await officer.save();
      }
    }

    const io = req.app.get("io") ;
    io.emit("status", officer) ; // notify all clients about status change
    
    res.json(officer);
  } catch (err) {
    console.log(err) ;
    res.status(500).json({ error: "Status update failed" });
  }
});

// Approve a report

officerRouter.post("/:officerId/reports/:reportId/approve", async (req, res) => {
  try {
    const { officerId, reportId } = req.params;

    // 1️⃣ Update the report
    const report = await Report.findByIdAndUpdate(
      reportId,
      { status: "approved", approvalDate: Date.now() },
      { new: true }
    );
    const department = report.department ;
    const updateOps = { $inc: {} };
    updateOps.$inc[`${department}.stats.pending`] = -1;
    updateOps.$inc[`${department}.stats.approved`] = 1;

     await NagarPalika.findOneAndUpdate({ nagarId: report.nagarId }, updateOps);

    if (!report) {
      return res.status(404).json({ error: "Report not found" });
    }

    // 2️⃣ Remove report from officer's assignedReports
    const officer = await Officer.findByIdAndUpdate(
      officerId,
      { $pull: { assignedReports: reportId } },
      { new: true }
    );

    if (!officer) {
      return res.status(404).json({ error: "Officer not found" });
    }

    // 3️⃣ If assignedReports is empty, set status to active
   await Officer.findByIdAndUpdate(officerId, { $pull: { assignedReports: reportId } });

// fetch updated officer to check assignedReports length
const updatedOfficer = await Officer.findById(officerId);
const io = req.app.get("io");
    

if (updatedOfficer.assignedReports.length === 0) {
  
  updatedOfficer.status = "active";
  await updatedOfficer.save();
  io.emit("status", updatedOfficer); 

}

res.json({ success: true, report, officer: updatedOfficer });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Approval failed" });
  }
});



// officer's Authentication 


module.exports = officerRouter;
