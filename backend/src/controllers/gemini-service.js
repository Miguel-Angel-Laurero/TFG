const { GoogleGenerativeAI } = require("@google/generative-ai");

const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) throw new Error("Falta la variable de entorno GEMINI_API_KEY.");

const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({
  model: "gemini-2.5-flash",
});

// ── helpers ──────────────────────────────────────────────────────────────────

function isNonEmptyString(v) {
  return typeof v === "string" && v.trim().length > 0;
}

function validateQuizQuestion(q, i) {
  if (!isNonEmptyString(q?.question))
    throw new Error(`quizQuestions[${i}].question es obligatorio.`);
  if (
    !Array.isArray(q.options) ||
    q.options.length !== 4 ||
    !q.options.every(isNonEmptyString)
  )
    throw new Error(
      `quizQuestions[${i}].options debe tener exactamente 4 opciones no vacías.`,
    );
  if (!Number.isInteger(q.correct) || q.correct < 0 || q.correct > 3)
    throw new Error(
      `quizQuestions[${i}].correct debe ser un entero entre 0 y 3.`,
    );
  if (!isNonEmptyString(q.tag))
    throw new Error(`quizQuestions[${i}].tag es obligatorio.`);
}

function validateGameContent(parsed) {
  if (
    !Array.isArray(parsed?.quizQuestions) ||
    !Array.isArray(parsed?.flashCards)
  )
    throw new Error("Faltan 'quizQuestions' o 'flashCards' como arrays.");
  if (parsed.quizQuestions.length !== 10)
    throw new Error(
      `Se esperaban 10 quizQuestions, llegaron ${parsed.quizQuestions.length}.`,
    );
  if (parsed.flashCards.length !== 10)
    throw new Error(
      `Se esperaban 10 flashCards, llegaron ${parsed.flashCards.length}.`,
    );
  parsed.quizQuestions.forEach(validateQuizQuestion);
  parsed.flashCards.forEach((c, i) => {
    if (!isNonEmptyString(c?.question) || !isNonEmptyString(c?.answer))
      throw new Error(`flashCards[${i}]: question y answer son obligatorios.`);
  });
}

// Llama a Gemini con un prompt de texto y, opcionalmente, un archivo en base64.
// Devuelve el JSON parseado de la respuesta.
async function callGemini(prompt, fileBuffer, mimeType) {
  const parts = [{ text: prompt }];
  if (fileBuffer) {
    parts.push({
      inlineData: { mimeType, data: fileBuffer.toString("base64") },
    });
  }

  const result = await model.generateContent({
    generationConfig: { responseMimeType: "application/json" },
    contents: [{ role: "user", parts }],
  });

  const raw = result.response.text().trim();
  const clean = raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
  return JSON.parse(clean);
}

// ── exports ───────────────────────────────────────────────────────────────────

async function processFileWithGemini(fileBuffer, mimeType, userPrompt = "") {
  const prompt = userPrompt
    ? `${userPrompt}\n\nIMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional.`
    : `Analiza el contenido del archivo adjunto y devuelve ÚNICAMENTE un objeto JSON válido con los datos más relevantes estructurados de forma clara.`;

  return callGemini(prompt, fileBuffer, mimeType);
}

async function generateGameContentFromPdf(fileBuffer, mimeType) {
  const prompt = `Analiza el documento adjunto y genera exactamente 10 preguntas de quiz tipo test y 10 flashcards sobre su contenido, en español.

Responde ÚNICAMENTE con el siguiente JSON válido, sin markdown ni texto extra:
{
  "quizQuestions": [
    { "id": 1, "question": "Texto de la pregunta", "options": ["Opción A", "Opción B", "Opción C", "Opción D"], "correct": 0, "tag": "nombre-del-tema" }
  ],
  "flashCards": [
    { "question": "Concepto o pregunta corta", "answer": "Respuesta directa y concisa" }
  ]
}

Reglas:
- "correct" es el índice (0-3) de la opción correcta
- Las 4 opciones deben ser plausibles pero solo una correcta
- Las respuestas de flashcards: máximo 2 frases
- Exactamente 10 elementos en cada array
- "tag" en kebab-case (ej: "tipos-coercion", "herencia-prototipos")`;

  const parsed = await callGemini(prompt, fileBuffer, mimeType);
  validateGameContent(parsed);
  return { quizQuestions: parsed.quizQuestions, flashCards: parsed.flashCards };
}

async function generateAdaptiveReinforcement(failedTopic) {
  const prompt = `El estudiante ha fallado repetidamente preguntas sobre: "${failedTopic}".

Responde ÚNICAMENTE con el siguiente JSON válido, sin markdown ni texto extra:
{
  "explanation": "Explicación clara del concepto clave (máximo 3 frases)",
  "question": {
    "question": "Pregunta de refuerzo",
    "options": ["Opción A", "Opción B", "Opción C", "Opción D"],
    "correct": 0,
    "tag": "${failedTopic}"
  }
}

Reglas:
- Explicación pedagógica, enfocada en el error típico del tema
- "correct" es el índice (0-3) de la opción correcta
- Las 4 opciones deben ser plausibles pero solo una correcta`;

  const parsed = await callGemini(prompt);
  if (
    !isNonEmptyString(parsed.explanation) ||
    typeof parsed.question !== "object"
  )
    throw new Error(
      "Gemini no devolvió el formato esperado para el refuerzo adaptativo.",
    );
  validateQuizQuestion(parsed.question, 0);
  return { explanation: parsed.explanation, question: parsed.question };
}

module.exports = {
  processFileWithGemini,
  generateGameContentFromPdf,
  generateAdaptiveReinforcement,
};
