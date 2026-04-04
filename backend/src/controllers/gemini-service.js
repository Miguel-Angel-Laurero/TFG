// Importa el cliente oficial de Google para la API de Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa el cliente con la API key guardada en las variables de entorno
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Selecciona el modelo a usar (gemini-2.5-flash: rápido y gratuito)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Helper mínimo para comprobar que Gemini no ha devuelto strings vacíos o nulos.
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

// Valida una pregunta de quiz individual antes de guardarla en la BD.
// Si algún campo clave viene mal, lanzamos error para evitar persistir datos rotos.
function validateQuizQuestion(question, index) {
  if (typeof question !== "object" || question === null) {
    throw new Error(
      `Gemini no devolvió el formato esperado: quizQuestions[${index}] no es un objeto válido.`,
    );
  }

  if (!isNonEmptyString(question.question)) {
    throw new Error(
      `Gemini no devolvió el formato esperado: quizQuestions[${index}].question es obligatorio.`,
    );
  }

  if (!Array.isArray(question.options) || question.options.length !== 4) {
    throw new Error(
      `Gemini no devolvió el formato esperado: quizQuestions[${index}].options debe tener exactamente 4 opciones.`,
    );
  }

  if (!question.options.every(isNonEmptyString)) {
    throw new Error(
      `Gemini no devolvió el formato esperado: quizQuestions[${index}].options contiene valores no válidos.`,
    );
  }

  if (
    !Number.isInteger(question.correct) ||
    question.correct < 0 ||
    question.correct > 3
  ) {
    throw new Error(
      `Gemini no devolvió el formato esperado: quizQuestions[${index}].correct debe ser un entero entre 0 y 3.`,
    );
  }
}

// Valida una flashcard individual: ambas partes deben existir y tener texto.
function validateFlashCard(card, index) {
  if (typeof card !== "object" || card === null) {
    throw new Error(
      `Gemini no devolvió el formato esperado: flashCards[${index}] no es un objeto válido.`,
    );
  }

  if (!isNonEmptyString(card.question)) {
    throw new Error(
      `Gemini no devolvió el formato esperado: flashCards[${index}].question es obligatorio.`,
    );
  }

  if (!isNonEmptyString(card.answer)) {
    throw new Error(
      `Gemini no devolvió el formato esperado: flashCards[${index}].answer es obligatorio.`,
    );
  }
}

// Valida el bloque completo generado por Gemini.
// Aquí comprobamos tanto la estructura general como el contenido de cada elemento.
function validateGeneratedGameContent(parsed) {
  if (
    typeof parsed !== "object" ||
    parsed === null ||
    !Array.isArray(parsed.quizQuestions) ||
    !Array.isArray(parsed.flashCards)
  ) {
    throw new Error(
      "Gemini no devolvió el formato esperado: faltan 'quizQuestions' o 'flashCards' como arrays.",
    );
  }

  // El prompt exige exactamente 10 preguntas y 10 flashcards;
  // lo validamos aquí para detectar respuestas parciales del modelo.
  if (parsed.quizQuestions.length !== 10) {
    throw new Error(
      `Gemini no devolvió el formato esperado: se esperaban 10 quizQuestions y llegaron ${parsed.quizQuestions.length}.`,
    );
  }

  if (parsed.flashCards.length !== 10) {
    throw new Error(
      `Gemini no devolvió el formato esperado: se esperaban 10 flashCards y llegaron ${parsed.flashCards.length}.`,
    );
  }

  // Si la estructura general es correcta, validamos elemento por elemento.
  parsed.quizQuestions.forEach(validateQuizQuestion);
  parsed.flashCards.forEach(validateFlashCard);
}

/**
 * Envía un archivo (buffer) junto a un prompt a Gemini y devuelve JSON parseado.
 * @param {Buffer} fileBuffer  - Contenido del archivo
 * @param {string} mimeType    - MIME type del archivo (e.g. "application/pdf", "text/plain")
 * @param {string} userPrompt  - Instrucción del usuario (opcional)
 * @returns {Promise<object>}  - Objeto JSON devuelto por Gemini
 */
async function processFileWithGemini(fileBuffer, mimeType, userPrompt = "") {
  // Convierte el buffer binario a base64, que es el formato que acepta la API de Gemini
  const base64Data = fileBuffer.toString("base64");

  // Prompt por defecto si el usuario no escribe ninguna instrucción
  const defaultInstruction = `Analiza el contenido del archivo adjunto y devuelve ÚNICAMENTE un objeto JSON válido (sin markdown, sin bloques de código, sin texto extra) con los datos más relevantes que encuentres estructurados de forma clara.`;

  // Si el usuario escribió un prompt propio, se añade la instrucción de responder en JSON
  // Si no escribió nada, se usa el prompt por defecto
  const finalPrompt = userPrompt
    ? `${userPrompt}\n\nIMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional.`
    : defaultInstruction;

  // Manda a Gemini tanto el texto del prompt como el archivo en base64 (inlineData)
  // Gemini soporta PDFs, imágenes, texto plano, etc.
  const result = await model.generateContent([
    { text: finalPrompt },
    {
      inlineData: {
        mimeType, // Le dice a Gemini qué tipo de archivo es
        data: base64Data, // El contenido del archivo codificado en base64
      },
    },
  ]);

  // Obtiene el texto crudo de la respuesta y elimina espacios sobrantes
  const raw = result.response.text().trim();

  // Gemini a veces envuelve el JSON en bloques ```json ... ```, esto los elimina
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  // Parsea el string a objeto JavaScript y lo devuelve
  return JSON.parse(clean);
}

/**
 * Genera contenido de minijuego (Quiz + Flashcards) a partir de un PDF.
 *
 * Esta función hace UNA SOLA llamada a Gemini y obtiene ambos formatos en una
 * única respuesta, minimizando el consumo de la API.
 *
 * El resultado se almacenará en la BD y se reutilizará en cada partida posterior
 * sin necesidad de volver a llamar a la IA.
 *
 * @param {Buffer} fileBuffer - Contenido binario del PDF
 * @param {string} mimeType   - MIME type del archivo (debe ser "application/pdf")
 * @returns {Promise<{ quizQuestions: object[], flashCards: object[] }>}
 */
async function generateGameContentFromPdf(fileBuffer, mimeType) {
  // Convierte el buffer a base64 para enviarlo como inlineData a Gemini
  const base64Data = fileBuffer.toString("base64");

  // Prompt diseñado para maximizar la calidad y evitar respuestas mal formateadas.
  // Se especifica el schema JSON exacto que se espera para poder parsearlo con
  // seguridad sin lógica adicional de corrección.
  const prompt = `Analiza el documento adjunto y genera exactamente 10 preguntas de quiz tipo test y 10 flashcards sobre su contenido, en español.

Responde ÚNICAMENTE con el siguiente JSON válido, sin markdown ni texto extra:
{
  "quizQuestions": [
    { "id": 1, "question": "Texto de la pregunta", "options": ["Opción A", "Opción B", "Opción C", "Opción D"], "correct": 0 }
  ],
  "flashCards": [
    { "question": "Concepto o pregunta corta", "answer": "Respuesta directa y concisa" }
  ]
}

Reglas obligatorias:
- El campo "correct" es el índice (0-3) de la opción correcta dentro del array "options"
- Las 4 opciones de cada pregunta deben ser plausibles pero solo una puede ser correcta
- Las respuestas de las flashcards deben ser cortas y directas (máximo 2 frases)
- Genera exactamente 10 elementos en cada array`;

  // Envía el prompt y el PDF a Gemini en una sola llamada
  const result = await model.generateContent([
    { text: prompt },
    {
      inlineData: {
        mimeType, // Indica a Gemini que el archivo adjunto es un PDF
        data: base64Data,
      },
    },
  ]);

  // Obtiene el texto crudo y elimina posibles bloques de código markdown
  const raw = result.response.text().trim();
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");

  // Parsea el JSON; si falla, lanzará un SyntaxError que el controller capturará
  const parsed = JSON.parse(clean);

  // Validación extra: asegura que la respuesta tiene la forma esperada antes de
  // guardarla en la BD, evitando datos corruptos en caso de respuesta parcial.
  validateGeneratedGameContent(parsed);

  return {
    quizQuestions: parsed.quizQuestions,
    flashCards: parsed.flashCards,
  };
}

module.exports = { processFileWithGemini, generateGameContentFromPdf };
