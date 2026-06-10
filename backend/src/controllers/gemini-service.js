const { createPartFromUri, createUserContent, FileState, GoogleGenAI } = require("@google/genai");

const apiKey = process.env.GEMINI_API_KEY;
const DEFAULT_GEMINI_MODELS = [
  "gemini-2.5-flash",
  "gemini-flash-latest",
  "gemini-3.5-flash",
  "gemini-2.5-flash-lite",
];
const geminiModels =
  (process.env.GEMINI_MODEL || process.env.GEMINI_MODELS)
    ?.split(",")
    .map((name) => name.trim())
    .filter(Boolean) ?? DEFAULT_GEMINI_MODELS;

let genAI = null;
const GEMINI_MAX_RETRIES = Math.max(1, Number(process.env.GEMINI_MAX_RETRIES || 1));
const GEMINI_RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);
const FILE_PROCESSING_MAX_POLLS = 12;
const FILE_PROCESSING_POLL_MS = 1500;

const USAGE_LOG_MAX = 500;
const geminiUsageLog = [];
let geminiLogLoaded = false;

const GEMINI_TOKEN_BUDGET = Number(process.env.GEMINI_TOKEN_BUDGET) || 15_000_000;

async function loadGeminiUsageLog() {
  if (geminiLogLoaded) return;
  const { GeminiUsageLog } = require("../models");
  const rows = await GeminiUsageLog.findAll({ order: [["id", "ASC"]] });
  for (const row of rows) {
    geminiUsageLog.push({
      timestamp: row.timestamp,
      model: row.model,
      promptTokens: row.promptTokens,
      outputTokens: row.outputTokens,
      totalTokens: row.totalTokens,
      cost: Number(row.cost),
    });
  }
  geminiLogLoaded = true;
}

function getTotalTokensUsed() {
  return geminiUsageLog.reduce((sum, entry) => sum + entry.totalTokens, 0);
}

async function isTokenBudgetExceeded() {
  await loadGeminiUsageLog();
  return getTotalTokensUsed() >= GEMINI_TOKEN_BUDGET;
}

const GEMINI_PRICES = {
  "gemini-2.5-flash":       { input: 0.15, output: 0.60 },
  "gemini-flash-latest":    { input: 0.15, output: 0.60 },
  "gemini-3.5-flash":       { input: 0.15, output: 0.60 },
  "gemini-2.5-flash-lite":  { input: 0.075, output: 0.30 },
};
const DEFAULT_PRICE = { input: 0.15, output: 0.60 };

function calculateCost(usageMetadata, modelName) {
  const promptTokens = usageMetadata?.promptTokenCount ?? 0;
  const outputTokens = usageMetadata?.candidatesTokenCount ?? 0;
  const price = GEMINI_PRICES[modelName] ?? DEFAULT_PRICE;
  const cost = (promptTokens * price.input + outputTokens * price.output) / 1_000_000;
  return { promptTokens, outputTokens, totalTokens: promptTokens + outputTokens, cost };
}

async function getGeminiUsageLog() {
  await loadGeminiUsageLog();
  return geminiUsageLog;
}

function isGeminiConfigured() {
  return Boolean(apiKey);
}

function ensureGeminiClient() {
  if (!isGeminiConfigured()) {
    const error = new Error("Gemini no esta configurado en este entorno.");
    error.code = "GEMINI_UNAVAILABLE";
    error.status = 503;
    throw error;
  }

  if (!genAI) {
    genAI = new GoogleGenAI({ apiKey });
  }
}

// ── schemas de salida estructurada ───────────────────────────────────────────
// Definen el contrato exacto de lo que Gemini debe devolver.
// Al pasarlos como responseSchema en generationConfig, la API garantiza que el
// JSON resultante cumple la estructura antes de devolverlo, eliminando la
// necesidad de limpiar markdown o tratar errores de parseo.

const QUIZ_QUESTION_SCHEMA = {
  type: "object",
  properties: {
    id: { type: "integer" },
    question: { type: "string" },
    options: { type: "array", items: { type: "string" } },
    correct: { type: "integer" },
    category: { type: "string" },
  },
  required: ["id", "question", "options", "correct", "category"],
};

// Schema para el quiz adaptativo: array plano de 50 preguntas
const ADAPTIVE_QUIZ_SCHEMA = {
  type: "object",
  properties: {
    questions: { type: "array", items: QUIZ_QUESTION_SCHEMA },
  },
  required: ["questions"],
};

const GAME_CONTENT_SCHEMA = {
  type: "object",
  properties: {
    quizQuestions: {
      type: "array",
      items: QUIZ_QUESTION_SCHEMA,
    },
    flashCards: {
      type: "array",
      items: {
        type: "object",
        properties: {
          question: { type: "string" },
          answer: { type: "string" },
        },
        required: ["question", "answer"],
      },
    },
  },
  required: ["quizQuestions", "flashCards"],
};

const ADAPTIVE_REINFORCEMENT_SCHEMA = {
  type: "object",
  properties: {
    explanation: { type: "string" },
    question: QUIZ_QUESTION_SCHEMA,
  },
  required: ["explanation", "question"],
};

// Schema para clasificar preguntas de quiz con un nivel de dificultad.
// Cada elemento del array devuelve el id original de la pregunta y su dificultad asignada:
//   1 = Básico   (conceptos fundamentales, sintaxis base)
//   2 = Intermedio (mecanismos internos, APIs menos conocidas)
//   3 = Avanzado   (comportamientos sutiles, patrones avanzados)
const DIFFICULTY_CLASSIFICATION_SCHEMA = {
  type: "object",
  properties: {
    classifications: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "integer" },
          difficulty: { type: "integer" },
        },
        required: ["id", "difficulty"],
      },
    },
  },
  required: ["classifications"],
};

// ── helpers ──────────────────────────────────────────────────────────────────

function validateGameContent(parsed) {
  if (!Array.isArray(parsed?.quizQuestions) || !Array.isArray(parsed?.flashCards))
    throw new Error("Faltan 'quizQuestions' o 'flashCards' como arrays.");
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRetryableGeminiError(error) {
  const status = Number(error?.status);
  if (GEMINI_RETRYABLE_STATUS.has(status)) return true;

  const message = String(error?.message ?? "").toLowerCase();
  return (
    message.includes("rate limit") ||
    message.includes("resource exhausted") ||
    message.includes("overloaded") ||
    message.includes("unavailable") ||
    message.includes("deadline exceeded")
  );
}

// Sube un buffer a la Gemini Files API y devuelve el objeto file resultante.
async function uploadBufferToFilesAPI(fileBuffer, mimeType) {
  ensureGeminiClient();

  const file = await genAI.files.upload({
    file: new Blob([fileBuffer], { type: mimeType }),
    config: {
      mimeType,
      displayName: `upload-${Date.now()}.pdf`,
    },
  });

  let currentFile = file;
  for (
    let poll = 0;
    currentFile?.state === FileState.PROCESSING && poll < FILE_PROCESSING_MAX_POLLS;
    poll += 1
  ) {
    await sleep(FILE_PROCESSING_POLL_MS);
    currentFile = await genAI.files.get({ name: file.name });
  }

  if (currentFile?.state === FileState.FAILED) {
    const error = new Error(currentFile.error?.message || "Gemini no pudo procesar el archivo.");
    error.status = 502;
    throw error;
  }

  if (currentFile?.state === FileState.PROCESSING) {
    const error = new Error(
      "Gemini sigue procesando el archivo. Intentalo de nuevo en unos segundos.",
    );
    error.status = 503;
    throw error;
  }

  return currentFile;
}

// Llama a Gemini con un prompt de texto y, opcionalmente, un archivo subido
// mediante la Files API. Devuelve el JSON parseado de la respuesta.
// @param {object} [responseSchema] - JSON Schema que Gemini debe respetar.
//   Con schema, la API garantiza JSON válido y estructurado: no hace falta
//   limpiar markdown ni capturar SyntaxError.
async function callGemini(prompt, fileBuffer, mimeType, responseSchema = null) {
  ensureGeminiClient();

  if (await isTokenBudgetExceeded()) {
    const used = getTotalTokensUsed();
    const error = new Error(
      `Presupuesto de tokens agotado: ${used.toLocaleString()} / ${GEMINI_TOKEN_BUDGET.toLocaleString()} tokens usados. Contacta al administrador o aumenta GEMINI_TOKEN_BUDGET.`,
    );
    error.code = "GEMINI_BUDGET_EXCEEDED";
    error.status = 429;
    throw error;
  }

  const parts = [{ text: prompt }];
  let uploadedFile = null;

  if (fileBuffer) {
    // La Files API evita el límite de ~20 MB de inlineData y es el método
    // recomendado por Google para PDFs y archivos de tamaño considerable.
    uploadedFile = await uploadBufferToFilesAPI(fileBuffer, mimeType);
    parts.push(createPartFromUri(uploadedFile.uri, uploadedFile.mimeType));
  }

  const generationConfig = { responseMimeType: "application/json" };
  if (responseSchema) generationConfig.responseSchema = responseSchema;

  try {
    let lastError = null;

    for (const modelName of geminiModels) {
      for (let attempt = 1; attempt <= GEMINI_MAX_RETRIES; attempt += 1) {
        try {
          const result = await genAI.models.generateContent({
            model: modelName,
            config: generationConfig,
            contents: createUserContent(parts),
          });

          if (result.usageMetadata) {
            const entry = {
              timestamp: new Date(),
              model: modelName,
              ...calculateCost(result.usageMetadata, modelName),
            };
            geminiUsageLog.push(entry);
            if (geminiUsageLog.length > USAGE_LOG_MAX) geminiUsageLog.shift();
            const { GeminiUsageLog } = require("../models");
            GeminiUsageLog.create({
              model: entry.model,
              promptTokens: entry.promptTokens,
              outputTokens: entry.outputTokens,
              totalTokens: entry.totalTokens,
              cost: entry.cost,
              timestamp: entry.timestamp,
            }).catch(() => {});
          }

          // Con responseSchema Gemini garantiza JSON válido → JSON.parse directo.
          // Sin schema se limpia por si acaso lleva envoltorio de markdown.
          const raw = result.text.trim();
          const clean = responseSchema
            ? raw
            : raw.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, "");
          return JSON.parse(clean);
        } catch (error) {
          lastError = error;
          if (!isRetryableGeminiError(error)) {
            throw error;
          }

          if (attempt < GEMINI_MAX_RETRIES) {
            const backoffMs = 700 * 2 ** (attempt - 1) + Math.floor(Math.random() * 250);
            await sleep(backoffMs);
          }
        }
      }

      console.warn(
        `[Gemini] Modelo ${modelName} no disponible temporalmente. Probando fallback...`,
      );
    }

    throw lastError;
  } finally {
    // Elimina el archivo de los servidores de Gemini una vez procesado
    if (uploadedFile) {
      genAI.files.delete({ name: uploadedFile.name }).catch(() => {});
    }
  }
}

// ── exports ───────────────────────────────────────────────────────────────────

async function processFileWithGemini(fileBuffer, mimeType, userPrompt = "") {
  const prompt = userPrompt
    ? `${userPrompt}\n\nIMPORTANTE: Responde ÚNICAMENTE con un objeto JSON válido, sin markdown ni texto adicional.`
    : `Analiza el contenido del archivo adjunto y devuelve ÚNICAMENTE un objeto JSON válido con los datos más relevantes estructurados de forma clara.`;

  return callGemini(prompt, fileBuffer, mimeType);
}

async function generateGameContentFromPdf(fileBuffer, mimeType) {
  const prompt = `Analiza el documento adjunto y genera exactamente 50 preguntas de quiz tipo test y 20 flashcards sobre su contenido, en español.

Reglas:
- "correct" es el índice (0-3) de la opción correcta
- Las 4 opciones deben ser plausibles pero solo una correcta
- Las respuestas de flashcards: máximo 2 frases
- Exactamente 50 preguntas de quiz y 20 flashcards
- "category" en kebab-case (ej: "tipos-coercion", "herencia-prototipos")`;

  const parsed = await callGemini(prompt, fileBuffer, mimeType, GAME_CONTENT_SCHEMA);
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
    "category": "${failedTopic}"
  }
}

Reglas:
- Explicación pedagógica, enfocada en el error típico del tema
- "correct" es el índice (0-3) de la opción correcta
- Las 4 opciones deben ser plausibles pero solo una correcta`;

  const parsed = await callGemini(prompt, null, null, ADAPTIVE_REINFORCEMENT_SCHEMA);
  return { explanation: parsed.explanation, question: parsed.question };
}

// ── generateAdaptiveQuizQuestions ────────────────────────────────────────────
// Recibe la distribución de categorías débiles y genera exactamente N preguntas
// en una sola llamada a Gemini, priorizando los conceptos donde el usuario falla.
// @param {Array<{ category: string, count: number }>} categories
// @returns {Promise<Array<QuizQuestion>>}
async function generateAdaptiveQuizQuestions(categories) {
  const total = categories.reduce((sum, c) => sum + c.count, 0);
  const breakdown = categories
    .map((c) => `- ${c.count} preguntas sobre "${c.category}"`)
    .join("\n");

  const prompt = `El estudiante necesita refuerzo en las siguientes áreas. Genera exactamente ${total} preguntas de quiz tipo test en español, distribuidas así:
${breakdown}

Cada pregunta debe centrarse en los conceptos que suelen ser difíciles para los estudiantes en ese tema.

Reglas:
- "correct" es el índice (0-3) de la opción correcta
- Las 4 opciones deben ser plausibles pero solo una correcta
- "category" debe ser exactamente el slug indicado arriba (ej: "scope-variables")
- Numera los "id" consecutivamente desde 1 hasta ${total}`;

  const parsed = await callGemini(prompt, null, null, ADAPTIVE_QUIZ_SCHEMA);
  if (!Array.isArray(parsed?.questions)) {
    throw new Error("[generateAdaptiveQuizQuestions] Gemini no devolvió el formato esperado.");
  }
  return parsed.questions;
}

module.exports = {
  isGeminiConfigured,
  processFileWithGemini,
  generateGameContentFromPdf,
  generateAdaptiveReinforcement,
  generateAdaptiveQuizQuestions,
  DIFFICULTY_CLASSIFICATION_SCHEMA,
  callGemini,
  getGeminiUsageLog,
  calculateCost,
  GEMINI_TOKEN_BUDGET,
  getTotalTokensUsed,
  isTokenBudgetExceeded,
  loadGeminiUsageLog,
};
