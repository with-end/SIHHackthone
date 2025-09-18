import { useState } from "react";
import axios from "axios";

export default function BatchTranslate() {
  const [texts, setTexts] = useState(["i will not be able to come yar", "i will be able to come yar", "i will definitely come yar"]);
  const [language, setLanguage] = useState("hi-IN");
  const [results, setResults] = useState([]);

  const handleTranslate = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/translate`, {
        texts,
        targetLanguage: language
      });
      console.log(response) ;
      setResults(response.data.translatedTexts);
    } catch (err) {
      console.error(err);
      setResults(["Translation failed"]);
    }
  };

  return (
    <div>
      <h2>Batch Translator</h2>
      <button onClick={handleTranslate}>Translate All Reports</button>
      <ul>
        {results.map((text, idx) => (
          <li key={idx}>{text}</li>
        ))}
      </ul>
    </div>
  );
}
