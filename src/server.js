const fs = require('fs');
const express = require("express");
const cors = require("cors");
const swaggerUi = require('swagger-ui-express');
const faceapi = require("face-api.js");
const analizeRouter = require("./documents.analize.controller.js");
const MODELS_PATH = __dirname + "/../infra/model";
const app = express();
const swaggerJson = JSON.parse(fs.readFileSync('./src/swagger.json', 'utf-8'));

app.use(cors());
app.use(express.json());
app.use(analizeRouter);
app.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerJson));

async function bootstrap() {
  await faceapi.nets.ssdMobilenetv1.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceLandmark68Net.loadFromDisk(MODELS_PATH);
  await faceapi.nets.faceRecognitionNet.loadFromDisk(MODELS_PATH);
  console.log("Models face-api started");
  app.listen(3000, () => console.log("Listening on http://localhost:3000"));
}

bootstrap().catch((error) => {
  console.error("Failed to start application:", error);
  process.exit(1);
});