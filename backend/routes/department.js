const express = require("express");
const router = express.Router();
const NagarPalika = require("../models/nagarPalica");
const Officer = require("../models/officer");

// ✅ Get officers of a department
router.get("/:id/department/:dept/officers", async (req, res) => {
  try {
    const { id, dept } = req.params;

    // Find NagarPalika by nagarId
    const nagar = await NagarPalika.findOne({ nagarId: id })
      .populate(`${dept}.officers`)
      .populate(`${dept}.head`);

    if (!nagar) return res.status(404).json({ error: "NagarPalika not found" });
    if (!nagar[dept]) return res.status(400).json({ error: "Invalid department" });

    const department = nagar[dept];

    // Build officers list with head first
    let officers = [];
    if (department.head) {
      officers.push(department.head); // put head at start
    }
    if (department.officers && department.officers.length > 0) {
      officers = officers.concat(department.officers);
    }

    res.json({ officers });
  } catch (err) {
    console.error("Error fetching officers:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Add officer to a department
router.post("/:id/department/:dept/add", async (req, res) => {
  try {
    const { id, dept } = req.params; 
    const { email, name, role, password } = req.body;

    // Find nagarpalika by custom nagarId
    const nagar = await NagarPalika.findOne({ nagarId: id });
    if (!nagar) return res.status(404).json({ error: "NagarPalika not found" });
    if (!nagar[dept]) return res.status(400).json({ error: "Invalid department" });

    // Create new officer
    const newOfficer = new Officer({ name, email, password, role });
    await newOfficer.save();

    // Assign to dept
    if (role === "main") {
      nagar[dept].head = newOfficer._id;
    } else {
      nagar[dept].officers.push(newOfficer._id);
    }

    await nagar.save();

    // Populate officers for response
    res.json({
      message: "Officer added",
      newOfficer,
    });
  } catch (err) {
    console.error("Error adding officer:", err);
    res.status(500).json({ error: err.message });
  }
});

// ✅ Remove officer from department
router.delete("/:id/department/:dept/remove/:officerId", async (req, res) => {
  try {
    const { id, dept, officerId } = req.params;
    const nagar = await NagarPalika.findOne({ nagarId: id });

    if (!nagar) return res.status(404).json({ error: "NagarPalika not found" });

    nagar[dept].officers = nagar[dept].officers.filter(
      (o) => o.toString() !== officerId
    );

    await Officer.findByIdAndDelete(officerId) ;
    await nagar.save();

    res.json({ message: "Officer removed" });
  } catch (err) {
    console.log(err) ;
    res.status(500).json({ error: err.message });
  }
});


// login for department officers 
router.post("/auth/:nagarId", async (req, res) => {
  try {
    const { nagarId } = req.params;
    const { email, password, department, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "email and password required" });
    }

    const nagar = await NagarPalika.findOne({ nagarId });
    if (!nagar) return res.status(404).json({ error: "nagarPalika not found" });

    // 🔹 Case 1: Main Officer
    if (role === "main") {
      const mainOfficer = await Officer.findById(nagar.mainOfficer);
      if (mainOfficer && mainOfficer.email === email && mainOfficer.password === password) {
        return res.json({ message: "login successful", success: true });
      }
      return res.status(401).json({ message: "invalid credentials", success: false });
    }

    if (!department || !role) {
      return res.status(400).json({ message: "department and role required" });
    }

    // 🔹 Case 2: Department Head
    if (role === "head") {
      const deptHead = await Officer.findById(nagar[department].head);
      if (deptHead && deptHead.email === email && deptHead.password === password) {
        return res.json({ message: "login successful", success: true });
      }
      return res.status(401).json({ message: "invalid credentials", success: false });
    }

    // 🔹 Case 3: Department Officer
    const officers = nagar[department].officers;
    const officer = await Officer.findOne({ _id: { $in: officers }, email });

    if (officer && officer.password === password) {
      return res.json({ message: "login successful", success: true });
    }

    return res.status(401).json({ message: "invalid credentials", success: false });

  } catch (err) {
    console.log(err);
    return res.status(500).json({ error: "error while authentication", success: false });
  }
});


module.exports = router;
