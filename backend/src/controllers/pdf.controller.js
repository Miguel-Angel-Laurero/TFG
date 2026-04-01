const { UserPdf } = require("../models");
const { generateGameContentFromPdf } = require("./gemini-service");

// ── uploadPdf ─────────────────────────────────────────────────────────────────
// Recibe un PDF (ya en memoria gracias a multer), lo envía a Gemini con UNA sola
// llamada para generar simultáneamente preguntas de Quiz y Flashcards, y guarda
// el resultado en la tabla UserPdfs.
//
// El archivo PDF en sí se descarta inmediatamente tras el procesado; la BD solo
// conserva el contenido JSON que generó Gemini, reduciendo el storage necesario.
//
// Responde con la metadata del registro creado (id, nombre, fecha) SIN incluir
// las preguntas/flashcards para no saturar la respuesta inicial.
// ─────────────────────────────────────────────────────────────────────────────
const uploadPdf = async (req, res, next) => {
  try {
    // multer ya validó el tipo MIME y guardó el archivo en req.file
    if (!req.file) {
      return res
        .status(400)
        .json({ error: "No se ha enviado ningún archivo." });
    }

    // Defensa extra: aunque el fileFilter de multer ya rechaza tipos inválidos,
    // verificamos el MIME aquí también para evitar errores confusos en Gemini
    if (req.file.mimetype !== "application/pdf") {
      return res.status(400).json({ error: "Solo se permiten archivos PDF." });
    }

    // Llama a Gemini con el buffer del PDF → devuelve { quizQuestions, flashCards }
    // Esta es la ÚNICA llamada a la IA en todo el ciclo de vida del PDF.
    // Cada vez que el usuario juegue con este PDF se leerán los datos de la BD.
    const { quizQuestions, flashCards } = await generateGameContentFromPdf(
      req.file.buffer,
      req.file.mimetype,
    );

    // Guarda el contenido generado en la BD asociado al usuario autenticado
    const pdf = await UserPdf.create({
      userId: req.user.id,
      originalName: req.file.originalname,
      quizQuestions,
      flashCards,
    });

    // Devuelve solo la metadata: el frontend la añade a la lista sin necesitar
    // las preguntas (que se pedirán individualmente al iniciar el juego)
    res.status(201).json({
      id: pdf.id,
      originalName: pdf.originalName,
      createdAt: pdf.createdAt,
    });
  } catch (error) {
    console.error("[uploadPdf] Error procesando PDF con Gemini:", error);

    // Error de parseo: Gemini devolvió texto que no es JSON válido
    if (error instanceof SyntaxError) {
      return res
        .status(502)
        .json({ error: "Gemini no devolvió un JSON válido." });
    }

    // Error de validación de formato lanzado desde gemini-service.js
    if (error.message?.includes("formato esperado")) {
      return res.status(502).json({ error: error.message });
    }

    next(error);
  }
};

// ── listPdfs ─────────────────────────────────────────────────────────────────
// Devuelve la lista de PDFs del usuario autenticado con solo la metadata
// (id, nombre, fecha). No incluye quizQuestions ni flashCards para no
// transferir datos innecesarios al listar.
// ─────────────────────────────────────────────────────────────────────────────
const listPdfs = async (req, res, next) => {
  try {
    const pdfs = await UserPdf.findAll({
      where: { userId: req.user.id },
      // Solo selecciona los campos de metadata, no el contenido de juego
      attributes: ["id", "originalName", "createdAt"],
      order: [["createdAt", "DESC"]], // Los más recientes primero
    });

    res.json(pdfs);
  } catch (error) {
    next(error);
  }
};

// ── getPdfQuiz ────────────────────────────────────────────────────────────────
// Devuelve las preguntas de Quiz de un PDF específico.
//
// El filtro `userId: req.user.id` en la query es el ownership check:
// aunque alguien conozca un id ajeno, la query no encontrará nada porque su
// userId no coincide → 404 (sin revelar si el PDF existe o es de otro usuario).
// ─────────────────────────────────────────────────────────────────────────────
const getPdfQuiz = async (req, res, next) => {
  try {
    const pdf = await UserPdf.findOne({
      where: { id: req.params.id, userId: req.user.id },
      attributes: ["quizQuestions"],
    });

    if (!pdf) {
      return res.status(404).json({ error: "PDF no encontrado." });
    }

    // Devuelve el array directamente para que useActivitySession pueda usarlo
    // con la misma interfaz que los JSON estáticos de /public
    res.json(pdf.quizQuestions);
  } catch (error) {
    next(error);
  }
};

// ── getPdfFlashCards ──────────────────────────────────────────────────────────
// Devuelve las tarjetas Flashcard de un PDF específico.
// Mismo ownership check que getPdfQuiz.
// ─────────────────────────────────────────────────────────────────────────────
const getPdfFlashCards = async (req, res, next) => {
  try {
    const pdf = await UserPdf.findOne({
      where: { id: req.params.id, userId: req.user.id },
      attributes: ["flashCards"],
    });

    if (!pdf) {
      return res.status(404).json({ error: "PDF no encontrado." });
    }

    // Devuelve el array directamente para compatibilidad con useActivitySession
    res.json(pdf.flashCards);
  } catch (error) {
    next(error);
  }
};

// ── deletePdf ─────────────────────────────────────────────────────────────────
// Elimina un PDF del usuario autenticado (metadata + contenido generado).
// El PDF original ya no existe en el sistema (nunca se persistió), así que
// esta operación solo borra el registro de la BD.
// Mismo ownership check para evitar borrados no autorizados.
// ─────────────────────────────────────────────────────────────────────────────
const deletePdf = async (req, res, next) => {
  try {
    const pdf = await UserPdf.findOne({
      where: { id: req.params.id, userId: req.user.id },
    });

    if (!pdf) {
      return res.status(404).json({ error: "PDF no encontrado." });
    }

    await pdf.destroy();
    res.json({ success: true });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  uploadPdf,
  listPdfs,
  getPdfQuiz,
  getPdfFlashCards,
  deletePdf,
};
