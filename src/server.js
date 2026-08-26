// import express from "express";
// import cors from "cors";
// import multer from "multer";
// import { compareFaces } from "./faceService.js";
// import swaggerUi from 'swagger-ui-express';
const express = require("express");
const cors = require("cors");
const multer = require("multer");
const { compareFaces } = require("./faceService.js");
const swaggerUi = require('swagger-ui-express');
const fs = require('fs');

const app = express();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });
const swaggerJson = JSON.parse(fs.readFileSync('./src/swagger.json', 'utf-8'));

app.use(cors());

app.use('/api/doc', swaggerUi.serve, swaggerUi.setup(swaggerJson));
app.post(
  "/api/validar-identidade",
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "documento", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files?.selfie || !req.files?.documento) {
        return res.status(400).json({ error: "Envie selfie e documento" });
      }

      const resultado = await compareFaces(
        req.files.selfie[0].buffer,
        req.files.documento[0].buffer
      );

      return res.json(resultado);
    } catch (err) {
      if (err.code === "NO_FACE_DETECTED") {
        return res.status(422).json({ error: "Não detectamos um rosto claro na imagem. Tente novamente." });
      }
      if (err.code === "MULTIPLE_FACES") {
        return res.status(422).json({ error: "Mais de um rosto detectado. Envie uma foto individual." });
      }
      console.error(err.details || err);
      return res.status(500).json({ error: "Erro ao processar validação" });
    }
  }
);

app.listen(3000, () => console.log("Rodando em http://localhost:3000"));