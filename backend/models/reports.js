const mongoose = require("mongoose");

const ReportSchema = new mongoose.Schema({
  reporterEmail: { type: String, required: true },
  department: { type: String }, // decided later by AI
  nagarId : { type: String , required: true } ,
  title: { type: String, required: true },
  description: { type: String, required: true },
  descriptionVector: { type: [Number], default: [] },
  imageUrl: { type: String },
  imageId : { type: String } ,
  imageVector: { type: [Number], default: [] },
  assignedOfficer : { type : mongoose.Schema.Types.ObjectId , ref : "Officer" } ,

  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true } // [lng, lat]
  },

  status: { type: String, enum: ["processing", "submitted", "duplicate"], default: "processing" },
  reportId : { type: String, unique: true } , 

  priority: { type: Number, default: 0 },

  submissionDate: { type: Date, default: Date.now },
  approvalDate: { type: Date },
  completionDate: { type: Date }
});

ReportSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Report", ReportSchema);
