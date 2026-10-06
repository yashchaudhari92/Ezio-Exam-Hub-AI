// src/utils/Facedetect.js
import * as faceapi from "face-api.js";

export async function loadModels() {
  const MODEL_URL = "/models";
  await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
  console.log("✅ Model Loaded");
}

// 🔥 RELAXED SETTINGS
const options = new faceapi.TinyFaceDetectorOptions({
  inputSize: 320,        // bigger = better detection
  scoreThreshold: 0.15,  // lower = more lenient
});

export async function detectFace(video) {
  try {
    const detections = await faceapi.detectAllFaces(video, options);
    return detections.length > 0;
  } catch {
    return true; // 🔥 fail-safe (avoid false punishment)
  }
}

export async function detectMultipleFaces(video) {
  try {
    const detections = await faceapi.detectAllFaces(video, options);
    return detections.length > 1;
  } catch {
    return false;
  }
}