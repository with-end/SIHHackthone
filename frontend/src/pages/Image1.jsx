import React, { useState, useRef, useEffect } from 'react';
import * as tf from '@tensorflow/tfjs';
import * as mobilenet from '@tensorflow-models/mobilenet';

const ImageSimilarity = () => {
  const [model, setModel] = useState(null);
  const [uploadedImage, setUploadedImage] = useState(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [similarity, setSimilarity] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Load MobileNet model
  useEffect(() => {
    const loadModel = async () => {
      const mobilenetModel = await mobilenet.load();
      setModel(mobilenetModel);
    };
    loadModel();
  }, []);

  // Start webcam only when needed
  const startWebcam = async () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    }
  };

  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setUploadedImage(ev.target.result);
      reader.readAsDataURL(file);
    }
  };

  const captureFromCamera = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
    const dataUrl = canvas.toDataURL('image/png');
    setCapturedImage(dataUrl);
  };

  const calculateSimilarity = async () => {
    if (!model || !uploadedImage || !capturedImage) return;

    const img1 = document.createElement('img');
    img1.src = uploadedImage;
    await img1.decode();

    const img2 = document.createElement('img');
    img2.src = capturedImage;
    await img2.decode();

    const embed1 = model.infer(img1, true);
    const embed2 = model.infer(img2, true);

    // Cosine similarity
    const cosineSimilarity = (a, b) => {
      const a1d = a.flatten();
      const b1d = b.flatten();
      const dot = a1d.dot(b1d).dataSync()[0];
      const normA = a1d.norm().dataSync()[0];
      const normB = b1d.norm().dataSync()[0];
      return dot / (normA * normB);
    };

    const sim = cosineSimilarity(embed1, embed2);
    setSimilarity(sim.toFixed(4));

    embed1.dispose();
    embed2.dispose();
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h1>Image Similarity: Upload vs Camera</h1>

      <div style={{ marginBottom: '10px' }}>
        <input type="file" accept="image/*" onChange={handleUpload} />
      </div>

      <div style={{ marginBottom: '10px' }}>
        <button onClick={startWebcam}>Start Camera</button>
        <button onClick={captureFromCamera} style={{ marginLeft: '10px' }}>
          Capture from Camera
        </button>
        <button onClick={calculateSimilarity} style={{ marginLeft: '10px' }}>
          Calculate Similarity
        </button>
      </div>

      <video
        ref={videoRef}
        width={400}
        height={300}
        autoPlay
        muted
        style={{ border: '1px solid #000', display: 'block', marginBottom: '10px' }}
      />

      <canvas ref={canvasRef} width={400} height={300} style={{ display: 'none' }} />

      {similarity !== null && <p>Similarity Score: {similarity}</p>}

      <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
        {uploadedImage && <img src={uploadedImage} alt="Uploaded" width={200} />}
        {capturedImage && <img src={capturedImage} alt="Captured" width={200} />}
      </div>
    </div>
  );
};

export default ImageSimilarity;
