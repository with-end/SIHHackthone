const reportQueue = require("./queue.js");
const { classifyDepartment, generateTextVector } = require("../utils/ai");
const { cosineSimilarity, hasHospitalOrSchool, sendMail } = require("../utils/helpers.js");
const Report = require("../models/reports.js");
const NagarPalika = require("../models/nagarPalica.js");
const Officer = require("../models/officer.js");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Worker connected to MongoDB");
  } catch (err) {
    console.error("❌ MongoDB connection error in worker:", err);
    process.exit(1);
  }
}
connectDB();

// Setup Redis clients for Socket.IO adapter
const pubClient = createClient({ url: process.env.UPSTASH_TCP_URL });
const subClient = pubClient.duplicate();

(async () => {
  await pubClient.connect();
  await subClient.connect();

  // Create a dummy Socket.IO server and attach Redis adapter
  const io = new Server();
  io.adapter(createAdapter(pubClient, subClient));

  // Start processing the queue
  reportQueue.process(async (job) => {
    const { reporterEmail, title, description, location, nagarId, imageUrl, imageId } = job.data;

    const department = await classifyDepartment(description);
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
        return { duplicateOf: candidate._id, issueId: candidate.reportId };
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
    console.log("report:" , report ) ;
    io.emit("assigned", report);

    return { issueId: report.reportId };
  });
})();
