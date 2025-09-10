import React, { useState } from "react";

// Function to calculate cosine similarity between two vectors
function cosineSimilarity(a, b) {
  const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
  const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
  const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
  return dot / (normA * normB);
}

export default function Duplicate() {
  // Dummy reports with fake "embeddings"
  const [reports] = useState([
    { id: 1, text: "broken streetlight", embedding: [0.12, -0.98, 0.33] },
    { id: 2, text: "lamp post not working", embedding: [0.11, -0.95, 0.30] },
    { id: 3, text: "garbage not collected", embedding: [0.85, 0.10, -0.50] },
    { id: 4, text: "trash pile near house", embedding: [0.82, 0.12, -0.55] },
    { id: 5, text: "pothole in the road", embedding: [-0.44, 0.90, 0.21] }
  ]);

  // Find duplicates (threshold = 0.85 similarity)
  const duplicates = [];
  for (let i = 0; i < reports.length; i++) {
    for (let j = i + 1; j < reports.length; j++) {
      const sim = cosineSimilarity(reports[i].embedding, reports[j].embedding);
      if (sim > 0.85) {
        duplicates.push({
          reportA: reports[i].text,
          reportB: reports[j].text,
          score: sim.toFixed(2)
        });
      }
    }
  }

  return (
    <div className="p-4 font-sans">
      <h1 className="text-xl font-bold mb-2">Duplicate Report Detection (Demo)</h1>
      <ul className="list-disc ml-6 mb-4">
        {reports.map(r => (
          <li key={r.id}>
            {r.text} <span className="text-gray-500">(embedding: {r.embedding.join(", ")})</span>
          </li>
        ))}
      </ul>

      <h2 className="text-lg font-semibold mb-2">Detected Duplicates:</h2>
      {duplicates.length > 0 ? (
        <ul className="list-disc ml-6">
          {duplicates.map((d, i) => (
            <li key={i}>
              "{d.reportA}" ≈ "{d.reportB}" (similarity: {d.score})
            </li>
          ))}
        </ul>
      ) : (
        <p>No duplicates found.</p>
      )}
    </div>
  );
}
