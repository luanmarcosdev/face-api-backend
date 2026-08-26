const faceapi = require("face-api.js");
const canvas = require("canvas");
const { Canvas, Image, ImageData } = canvas;

// Faz o face-api.js funcionar no Node (ele espera ambiente de browser)
faceapi.env.monkeyPatch({ Canvas, Image, ImageData });

const MODELS_PATH = __dirname + "/../infra/model";
let modelsLoaded = false;

async function loadModels() {
  if (modelsLoaded) return;
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
  modelsLoaded = true;
  console.log("Modelos face-api.js carregados");
}

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

// Classifica a diferença entre os vetores faciais em faixas qualitativas,
// calibradas para o cenário selfie vs. foto de documento (que naturalmente
// tem diferença maior que selfie vs. selfie, mesmo sendo a mesma pessoa).
// AJUSTE ESSAS FAIXAS conforme os testes em lote com fotos reais de vocês.
function classificarSimilaridade(distanciaCartografica) {
  if (distanciaCartografica < 0.45) {
    return { nivel: "alta_confianca", aprovado: true };
  }
  if (distanciaCartografica < 0.6) {
    return { nivel: "confianca_moderada", aprovado: true };
  }
  if (distanciaCartografica < 0.7) {
    return { nivel: "duvidoso", aprovado: false }; // sugerir revisão manual
  }
  return { nivel: "reprovado", aprovado: false };
}

async function compareFaces(selfieBuffer, documentBuffer) {
  await loadModels();

  const descriptorSelfie = await getFaceDescriptor(selfieBuffer);
  const descriptorDocumento = await getFaceDescriptor(documentBuffer);

  // Distancia euclidiana (diferenca entre os vetores faciais).
  const distanciaCartografica = faceapi.euclideanDistance(descriptorSelfie, descriptorDocumento);
  const { nivel, aprovado } = classificarSimilaridade(distanciaCartografica);

  return { 
    status: aprovado, 
    nivel, 
    sugestao: aprovado ? "Identidade validada" : "Não foi possível confirmar a identidade, solicitar novos documentos",
    distanciaCartografica 
  };
}

module.exports = { compareFaces };