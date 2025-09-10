const express = require("express");
const Officer = require("../models/officer");
const Report = require("../models/Report");
const NagarPalika = require("../models/NagarPalika");

const officerRouter = express.Router();

// Get all assigned reports for officer
officerRouter.get("/:officerId/reports", async (req, res) => {
  try {
    const reports = await Report.find({ assignedOfficer: req.params.officerId });
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

    if (status === "active") {
      // find pending reports from officer’s department
      const nagar = await NagarPalika.findOne({ [`${officer.role}.officers`]: officer._id });
      let deptKey = null;
      for (let key of ["roads", "electricity", "sanitation", "water", "others"]) {
        if (nagar[key].officers.some(o => o.toString() === officer._id.toString())) {
          deptKey = key;
          break;
        }
      }

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

    res.json(officer);
  } catch (err) {
    res.status(500).json({ error: "Status update failed" });
  }
});

// Approve a report
officerRouter.post("/:officerId/reports/:reportId/approve", async (req, res) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.reportId,
      { status: "processing", approvalDate: Date.now() },
      { new: true }
    );
    res.json(report);
  } catch (err) {
    res.status(500).json({ error: "Approval failed" });
  }
});


// officer's Authentication 


module.exports = officerRouter;
