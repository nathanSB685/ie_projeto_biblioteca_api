const express = require("express");
const router = express.Router();
const multer = require("multer");
const AI_Controller = require("../controllers/AI_Controller");

// Configura o multer para guardar o arquivo apenas na memória (RAM), e não no HD do PC
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // Limite matemático de 5MB (5 * 1024 KB * 1024 Bytes)
  },
  fileFilter: (req, file, cb) => {
    const formatosAceitos = [
      "image/jpeg",
      "image/png",
      "image/webp",
      "image/heic",
      "image/heif",
    ];

    if (formatosAceitos.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(
        new Error(
          "Formato inválido. Apenas imagens  JPG, PNG, WEBP, ou HEIC são aceitas.",
        ),
      );
    }
  },
});

// A rota recebe o arquivo no campo chamado "imagem" e passa para o nosso controller
router.post("/ler-capa", upload.single("imagem"), AI_Controller.analisarCapa);

module.exports = router;
