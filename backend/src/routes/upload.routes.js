const router = require("express").Router();
const multer = require("multer");
const { processFileWithGemini } = require("../controllers/gemini-service");

// Configura multer para guardar el archivo en memoria RAM (no en disco)
// Así podemos pasarle el buffer directamente a Gemini sin ficheros temporales
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 }, // Tamaño máximo permitido: 20 MB
});

// POST /api/upload
// Recibe un archivo (campo "file") y un prompt opcional (campo "prompt") como FormData
router.post("/", upload.single("file"), async (req, res) => {
  try {
    // Si no se adjuntó ningún archivo, devuelve error 400
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No se ha enviado ningún archivo." });
    }

    // Extrae el buffer (contenido binario) y el tipo MIME del archivo subido
    const { buffer, mimetype } = req.file;

    // Recoge el prompt del cuerpo del request (vacío si el usuario no escribió nada)
    const userPrompt = req.body.prompt || "";

    // Llama al servicio que manda el archivo + prompt a Gemini y espera el JSON resultante
    const jsonResult = await processFileWithGemini(
      buffer,
      mimetype,
      userPrompt,
    );

    // Devuelve el JSON generado por Gemini al frontend
    res.json({ success: true, data: jsonResult });
  } catch (error) {
    console.error("Error procesando archivo con Gemini:", error);

    // Si el JSON que devolvió Gemini no era válido, error de parsing
    if (error instanceof SyntaxError) {
      return res
        .status(502)
        .json({ error: "Gemini no devolvió un JSON válido." });
    }

    // Cualquier otro error inesperado
    res.status(500).json({ error: "Error al procesar el archivo." });
  }
});

module.exports = router;
