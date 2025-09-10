import React, { useState } from "react";
import * as tf from "@tensorflow/tfjs";
import * as mobilenet from "@tensorflow-models/mobilenet";

export default function Imagedup() {
  const [image1, setImage1] = useState(null);
  const [image2, setImage2] = useState(null);
  const [similarity, setSimilarity] = useState(null);

  // Function to get feature vector (embedding)
  const getEmbedding = async (imgElement) => {
    const model = await mobilenet.load();
    const prediction = model.infer(imgElement, true); // `true` gives embeddings
    return prediction;
  };

  // Compute cosine similarity between two embeddings
  const cosineSimilarity = (a, b) => {
    const dot = a.reduce((sum, val, i) => sum + val * b[i], 0);
    const normA = Math.sqrt(a.reduce((sum, val) => sum + val * val, 0));
    const normB = Math.sqrt(b.reduce((sum, val) => sum + val * val, 0));
    return dot / (normA * normB);
  };

  const handleCompare = async () => {
    if (!image1 || !image2) return;

    const embedding1 = await getEmbedding(document.getElementById("img1"));
    const embedding2 = await getEmbedding(document.getElementById("img2"));

    // Convert tensor to array
    const arr1 = embedding1.dataSync();
    const arr2 = embedding2.dataSync();

    const sim = cosineSimilarity(arr1, arr2);
    setSimilarity(sim.toFixed(4));
  };

  return (
    <div style={{ textAlign: "center" }}>
      <h2>Image Similarity Checker</h2>

      <div>
        <input type="file" onChange={(e) => setImage1(URL.createObjectURL(e.target.files[0]))} />
        <input type="file" onChange={(e) => setImage2(URL.createObjectURL(e.target.files[0]))} />
      </div>

      <div style={{ display: "flex", justifyContent: "center", margin: "20px" }}>
        {image1 && <img id="img1" src={image1} alt="Image 1" width={200} />}
        {image2 && <img id="img2" src={image2} alt="Image 2" width={200} />}
      </div>

      <button onClick={handleCompare}>Compare Images</button>

      {similarity && <h3>Similarity: {similarity}</h3>}
    </div>
  );
}
