const canvas = require("canvas");
// const { Canvas, Image, ImageData } = canvas;
const faceapi = require("face-api.js");

async function getFaceDescriptor(imageBuffer) {
  const img = await canvas.loadImage(imageBuffer);

  const detections = await faceapi
    .detectAllFaces(img)
    .withFaceLandmarks()
    .withFaceDescriptors();

  if (detections.length === 0) {
    const err = new Error("Nenhuma face detectada na imagem");
    err.code = "NO_FACE_DETECTED";
    throw err;
  }

  if (detections.length > 1) {
    const err = new Error("Mais de uma face detectada na imagem");
    err.code = "MULTIPLE_FACES";
    throw err;
  }

  return detections[0].descriptor; // Float32Array de 128 posições
}

module.exports = { getFaceDescriptor };