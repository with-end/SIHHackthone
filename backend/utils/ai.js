const axios = require("axios");
const { GoogleGenerativeAI } = require("@google/generative-ai"); // ✅
const dotenv = require("dotenv");

dotenv.config();

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

// Init Gemini client
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

// 1. Department classification via OpenRouter
async function classifyDepartment(description) {
  try {
    const res = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-4o-mini",
        messages: [
          {
            role: "system",
            content:
              "Classify this issue into exactly one department: roads, water, electricity, sanitation, health  ,inValid. Reply only with the department name.",
          },
          { role: "user", content: description },
        ],
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return res.data.choices[0].message.content.trim();
  } catch (err) {
    console.error("Department classification failed:", err.message);
    return "General"; // fallback
  }
}

// 2. Generate text embeddings
async function generateTextVector(text) {
  try {
    const model = genAI.getGenerativeModel({ model: "text-embedding-004" }); // ✅ new embedding model
    const result = await model.embedContent(text);
    return result.embedding.values; // embedding array
  } catch (err) {
    console.error("Text embedding failed:", err.response?.data || err.message);
    return [];
  }
}

// 3. Generate image embeddings
async function generateImageVector(imageUrl) {
  try {
    // ✅ Step 1: Optimize via Cloudinary (resize to max 512px, compress, auto-format)
    const optimizedUrl = imageUrl.replace(
      "/upload/",
      "/upload/w_512,h_512,c_limit,f_auto,q_auto/"
    );

    // ✅ Step 2: Fetch optimized image as binary
    const response = await axios.get(optimizedUrl, { responseType: "arraybuffer" });

    // ✅ Step 3: Convert to Base64
    const imageBase64 = Buffer.from(response.data, "binary").toString("base64");

    // ✅ Step 4: Call Vertex AI Multimodal Embedding API
    const res = await axios.post(
      `https://generativelanguage.googleapis.com/v1beta/models/multimodalembedding@001:predict?key=${process.env.GEMINI_API_KEY}`,
      {
        instances: [
          {
            image: {
              bytesBase64Encoded: imageBase64,
              mimeType: "image/jpeg",
            },
            parameters: {
              dimension: 512, // can be 128, 256, 512, or 1408
            },
          },
        ],
      },
      { headers: { "Content-Type": "application/json" } }
    );

    // ✅ Step 5: Return embedding vector
    return res.data.predictions[0].imageEmbedding;
  } catch (err) {
    console.error(
      "Image embedding failed:",
      err.response?.data || err.message
    );
    return [];
  }
}
module.exports = {
  classifyDepartment,
  generateTextVector,
  generateImageVector,
};
