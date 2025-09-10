import React, { useState } from "react";

export default function ReportIssue() {
  const [description, setDescription] = useState("");
  const [department, setDepartment] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePredict = async () => {
    if (!description.trim()) return;
    setLoading(true);

    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini", // you can change model (claude, mistral, etc.)
          messages: [
            {
              role: "system",
              content:
                "You are an assistant that classifies civic issues into one of these departments: electricity, roads, water, sanitation, others. Only return the department name.",
            },
            { role: "user", content: description },
          ],
        }),
      });

      const data = await response.json();
      const prediction = data.choices?.[0]?.message?.content?.trim();
      setDepartment(prediction || "Not sure");
    } catch (err) {
      console.error(err);
      setDepartment("Error predicting");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 bg-white shadow-lg rounded-2xl p-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Report an Issue</h2>

      <textarea
        className="w-full p-3 border rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500"
        rows="4"
        placeholder="Describe the issue..."
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      ></textarea>

      <button
        onClick={handlePredict}
        disabled={loading}
        className="mt-4 w-full bg-indigo-600 text-white py-2 px-4 rounded-xl hover:bg-indigo-700 transition disabled:opacity-50"
      >
        {loading ? "Analyzing..." : "Predict Department"}
      </button>

      {department && (
        <p className="mt-3 text-indigo-600 font-semibold">
          🤖 Suggested Department: {department}
        </p>
      )}
    </div>
  );
}
