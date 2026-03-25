// Importa el cliente oficial de Google para la API de Gemini
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Inicializa el cliente con la API key guardada en las variables de entorno
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Selecciona el modelo a usar (gemini-2.5-flash: rápido y gratuito)
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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

module.exports = { processFileWithGemini };
