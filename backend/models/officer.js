const mongoose = require("mongoose");

const OfficerSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }, // hashed password ideally
    role: { type: String, enum: ["main", "sub"], default: "sub" },
    status : { type: String , enum: ["active", "inactive","busy"] , default : "active" },
    assignedReports : [ { type : mongoose.Schema.Types.ObjectId , ref : "Report"}]
  },
  { timestamps: true }
);

// ✅ Use OfficerSchema correctly
const Officer = mongoose.model("Officer", OfficerSchema);

module.exports = Officer;
