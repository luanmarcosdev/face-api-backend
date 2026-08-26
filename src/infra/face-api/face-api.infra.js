const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;
const { getFaceDescriptor } = require("../canvas/canvas.infra.js");

// faz o face-api.js funcionar no Node (ele espera ambiente de browser)
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

async function compareFaces(selfieBuffer, documentBuffer) {
  const descriptorSelfie = await getFaceDescriptor(selfieBuffer);
  const descriptorDocument = await getFaceDescriptor(documentBuffer);

  // Distancia euclidiana (diferenca entre os vetores faciais).
  const cartographyDistance = faceapi.euclideanDistance(descriptorSelfie, descriptorDocument);
  
  return cartographyDistance;
}

module.exports = { compareFaces };