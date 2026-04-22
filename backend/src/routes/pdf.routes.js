const router = require("express").Router();
const multer = require("multer");
const { authMiddleware } = require("../middlewares/auth.middleware");
const {
  uploadPdf,
  listPdfs,
  listPdfsWithContent,
  getPdfQuiz,
  getPdfFlashCards,
  deletePdf,
  savePdfQuestions,
} = require("../controllers/pdf.controller");

// ── Configuración de multer ───────────────────────────────────────────────────
// Almacena el archivo en RAM (memoryStorage) en lugar de en disco, lo que
// permite pasarle el buffer directamente a Gemini sin crear ficheros temporales.
//
// El fileFilter rechaza cualquier tipo que no sea PDF ANTES de que el archivo
// llegue al controller, así Gemini nunca recibe un archivo no válido.
// ─────────────────────────────────────────────────────────────────────────────
const upload = multer({
  storage: multer.memoryStorage(),

  // Tamaño máximo del PDF: 10 MB (Gemini admite hasta ~20 MB pero 10 es suficiente)
  limits: { fileSize: 10 * 1024 * 1024 },

  // Filtro de tipo de archivo: solo se acepta application/pdf
  fileFilter: (_req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true); // Acepta el archivo
    } else {
      // Rechaza el archivo con un error descriptivo (código 400 en el handler de errores)
      cb(new Error("Solo se permiten archivos PDF."), false);
    }
  },
});

// ── Rutas ────────────────────────────────────────────────────────────────────
// Todas las rutas requieren autenticación JWT (authMiddleware).
// El token se verifica antes de ejecutar cualquier lógica de negocio.

// POST /api/pdfs
// Recibe un PDF (campo "file" en FormData), lo procesa con Gemini y guarda el
// resultado en la BD. Responde con la metadata del PDF creado.
router.post("/", authMiddleware, upload.single("file"), uploadPdf);

// GET /api/pdfs/sync
// Devuelve todos los PDFs del usuario que tienen contenido generado, incluyendo
// quizQuestions y flashCards. Usado al iniciar sesión para hidratar el localStorage.
// Debe declararse ANTES de /:id para que Express no lo interprete como un parámetro.
router.get("/sync", authMiddleware, listPdfsWithContent);

// GET /api/pdfs
// Devuelve la lista de PDFs del usuario autenticado (solo metadata, sin contenido).
router.get("/", authMiddleware, listPdfs);

// GET /api/pdfs/:id/quiz
// Devuelve el array de preguntas de Quiz asociadas al PDF indicado.
// Verificación de ownership incluida en el controller (solo el dueño puede acceder).
router.get("/:id/quiz", authMiddleware, getPdfQuiz);

// GET /api/pdfs/:id/flashcards
// Devuelve el array de Flashcards asociadas al PDF indicado.
// Misma verificación de ownership que /quiz.
router.get("/:id/flashcards", authMiddleware, getPdfFlashCards);

// DELETE /api/pdfs/:id
router.delete("/:id", authMiddleware, deletePdf);

// PUT /api/pdfs/:id/questions
// Guarda en la BD las preguntas y flashcards que el usuario tiene en localStorage.
// Solo el dueño del PDF puede llamar a este endpoint (verificado en el controller).
router.put("/:id/questions", authMiddleware, savePdfQuestions);

module.exports = router;
