const Queue = require("bull");
const dotenv = require("dotenv");

dotenv.config();

// Parse Upstash TCP URL
const url = new URL(process.env.UPSTASH_TCP_URL);

const redisConfig = {
  port: Number(url.port),
  host: url.hostname,
  password: url.password,
  tls: {}, // Required for Upstash since it's TLS (rediss://)
};

const reportQueue = new Queue("report-generation", {
  redis: redisConfig,
});

// Queue event listeners
reportQueue.on("error", (err) => console.error("❌ Queue error:", err));
reportQueue.on("waiting", (jobId) => console.log(`⏳ Job ${jobId} waiting in queue...`));
reportQueue.on("completed", (job) => console.log(`✅ Job ${job.id} completed`));
reportQueue.on("failed", (job, err) => console.error(`❌ Job ${job.id} failed:`, err));

module.exports = reportQueue;
