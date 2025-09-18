const express = require("express");
const router = express.Router();
const { SarvamAIClient } = require("sarvamai");

// Initialize Sarvam client
const client = new SarvamAIClient({
  apiSubscriptionKey: process.env.SERVAM_API_KEY
});

// Batch translation endpoint
router.post("/translate", async (req, res) => {
  const { texts, targetLanguage } = req.body;

  if (!Array.isArray(texts) || texts.length === 0) {
    return res.status(400).json({ error: "texts must be a non-empty array" });
  }

  try {
    // Run all translations in parallel
    const translations = await Promise.all(
      texts.map(async (txt) => {
        const response = await client.text.translate({
          input: txt,
          source_language_code: "auto",
          target_language_code: targetLanguage
        });
        return response.translated_text;
      })
    );

    res.json({ translatedTexts: translations });
  } catch (error) {
    console.error(error.response?.data || error.message || error);
    res.status(500).json({ error: "Batch translation failed" });
  }
});

module.exports = router;
