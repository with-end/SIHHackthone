import { useState } from "react";

async function translateText(text, targetLang) {
  const response = await fetch("http://localhost:5000/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, targetLang }),
  });
  const data = await response.json();
  return data.translatedText;
}

export default function Report({ reportText }) {
  const [translated, setTranslated] = useState("");

  const handleTranslate = async (lang) => {
    const result = await translateText(reportText, lang);
    setTranslated(result);
  };

  return (
    <div>
      <p><b>Original:</b> {reportText}</p>
      <button onClick={() => handleTranslate("hi")}>Hindi</button>
      <button onClick={() => handleTranslate("ta")}>Tamil</button>
      <button onClick={() => handleTranslate("bn")}>Bengali</button>
      <p><b>Translated:</b> {translated}</p>
    </div>
  );
}
