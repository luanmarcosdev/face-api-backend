const router = require("express").Router();
const multer = require("multer");
const { compareFaces } = require("./infra/face-api/face-api.infra.js");
const DocumentAnalizeDomain = require("./documents.analize.domain.js");

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.post(
  "/api/documents/analize",
  upload.fields([
    { name: "selfie", maxCount: 1 },
    { name: "documento", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      if (!req.files?.selfie || !req.files?.documento) {
        return res.status(400).json({ error: "Envie selfie e documento" });
      }

      const cartographyDistance = await compareFaces(
        req.files.selfie[0].buffer,
        req.files.documento[0].buffer
      );

      const analise = await DocumentAnalizeDomain.analize(cartographyDistance);

      return res.status(200).json({
        success: analise.success,
        confidenceLevel: analise.confidenceLevel,
        message: analise.message,
        cartographyDistance: cartographyDistance,
      });

    } catch (err) {
      if (err.code === "NO_FACE_DETECTED") {
        return res.status(422).json({
            success: false,
            status: 422,
            error: "Não detectamos um rosto claro na imagem. Tente novamente."
        });
      }
      if (err.code === "MULTIPLE_FACES") {
        return res.status(422).json({
            success: false,
            status: 422,
            error: "Mais de um rosto detectado. Envie uma foto individual."
        });
      }

      if (err.code === "NOT_A_NUMBER") {
        return res.status(400).json({
            success: false,
            status: 400,
            error: "Distância cartográfica inválida"
        });
      }

      console.error(err.details || err);
      return res.status(500).json({
          success: false,
          status: 500,
          error: "Erro ao processar validação"
      });
    }
  }
);

module.exports = router;