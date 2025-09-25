const express = require("express");
const cors = require("cors");
const app = express();
const dbConnect = require("./config/dbConnect.js");
const cloudinaryConfig = require("./config/cloudinaryConfig.js");
const dotenv = require("dotenv");
const { PORT, FRONTEND_URL, UPSTASH_TCP_URL } = require("./config/dotenv.config.js");
dotenv.config();

const nagarPalikaRoutes = require("./routes/nagarPalika.js");
const bodyParser = require("body-parser");
const ReportRoutes = require("./routes/Report.js");
const departmentRoutes = require("./routes/department.js");
const officersRoutes = require("./routes/officer.js");
const translationRoutes = require("./routes/translation.js");
const http = require("http");
const { Server } = require("socket.io");
const { createAdapter } = require("@socket.io/redis-adapter");
const { createClient } = require("redis");

// Create HTTP server for Express + Socket.IO
const server = http.createServer(app);

// Initialize Socket.IO
const io = new Server(server, {
  cors: {
    origin: FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
  },
});

// Setup Redis adapter for Socket.IO (works across multiple processes, e.g., worker)
const pubClient = createClient({ url: process.env.UPSTASH_TCP_URL });
const subClient = pubClient.duplicate();

(async () => {
  try {
    await pubClient.connect();
    console.log("✅ pubClient connected to Redis");

    await subClient.connect();
    console.log("✅ subClient connected to Redis");

    io.adapter(createAdapter(pubClient, subClient));
    console.log("✅ Redis adapter initialized for Socket.IO");
  } catch (err) {
    console.error("❌ Redis connection failed:", err);
  }
})();


// Make io available in routes if needed
app.set("io", io);

// Middleware
app.use(express.json());
app.use(cors());
app.use(bodyParser.json());

// Routes
app.get("/", (req, res) => {
  res.send("Backend is live now updated");
});
app.use("/api/nagarpalika", nagarPalikaRoutes);
app.use("/api/reports", ReportRoutes);
app.use("/api", departmentRoutes);
app.use("/api/officer", officersRoutes);
app.use("/api", translationRoutes);

// Socket.IO events
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`Server running on the port :${PORT}`);
  dbConnect();
  cloudinaryConfig();
});

