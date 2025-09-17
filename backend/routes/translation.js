const express = require("express") ;
const router = express.Router() ;
const axios = require("axios") ;

router.post("/translate", async (req, res) => {
  const { text, target } = req.body;
  if (!text || !target) return res.status(400).json({ error: "Missing text or target" });

  try {
    const response = await axios.post(
      "https://libretranslate.com/translate",
      {
        q: text,
        source: "en",
        target: target,
        format: "text",
      },
      {
        headers: { "Content-Type": "application/json" },
      }
    );
    
    res.json({ translatedText: response.data.translatedText });
  } catch (err) {
    console.log(err) ;
    res.status(500).json({ error: "Translation failed" });
  }
});

module.exports = router ;
