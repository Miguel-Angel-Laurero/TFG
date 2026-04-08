/**
 * assignDifficulty.js
 * ─────────────────────────────────────────────────────────────────────────────
 * Script de utilidad que clasifica automáticamente las preguntas de
 * quizQuestions.json en tres niveles de dificultad usando Gemini.
 *
 * Uso:
 *   node backend/scripts/assignDifficulty.js
 *
 * Requisitos:
 *   - Variable de entorno GEMINI_API_KEY disponible (o fichero .env en /backend)
 *   - npm install en /backend
 *
 * El script sobreescribe el fichero con el campo `difficulty` añadido/actualizado.
 * Las preguntas que ya tienen `difficulty` asignado se respetan a menos que
 * se pase el flag --force.
 * ─────────────────────────────────────────────────────────────────────────────
 */

require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const fs = require("fs");
const path = require("path");

const {
  callGemini,
  DIFFICULTY_CLASSIFICATION_SCHEMA,
} = require("../src/controllers/gemini-service");

const QUESTIONS_PATH = path.join(
  __dirname,
  "../../ludoScript/public/quizQuestions.json",
);

const FORCE = process.argv.includes("--force");

async function main() {
  // ── Leer preguntas ──────────────────────────────────────────────────────────
  const questions = JSON.parse(fs.readFileSync(QUESTIONS_PATH, "utf-8"));

  const toClassify = FORCE
    ? questions
    : questions.filter((q) => q.difficulty == null);

  if (toClassify.length === 0) {
    console.log(
      "✅ Todas las preguntas ya tienen dificultad asignada. Usa --force para reclasificar.",
    );
    return;
  }

  console.log(`🔍 Clasificando ${toClassify.length} preguntas con Gemini...`);

  // ── Preparar prompt ─────────────────────────────────────────────────────────
  const questionsText = toClassify
    .map(
      (q) =>
        `ID ${q.id} [${q.category}]: ${q.question}\nOpciones: ${q.options.join(" | ")}\nRespuesta correcta: ${q.options[q.correct]}`,
    )
    .join("\n\n");

  const prompt = `Eres un experto en JavaScript. Clasifica cada pregunta con un nivel de dificultad:
  1 = Básico    — conceptos fundamentales y sintaxis base que todo desarrollador debe conocer.
  2 = Intermedio — mecanismos internos del lenguaje, APIs menos evidentes, comportamientos no triviales.
  3 = Avanzado  — casos edge, patrones avanzados, comportamientos sutiles o conocimiento profundo del runtime.

Preguntas a clasificar:

${questionsText}

Devuelve EXCLUSIVAMENTE el JSON estructurado con el array "classifications", sin texto adicional.`;

  // ── Llamar a Gemini ─────────────────────────────────────────────────────────
  const result = await callGemini(
    prompt,
    null,
    null,
    DIFFICULTY_CLASSIFICATION_SCHEMA,
  );

  if (!Array.isArray(result?.classifications)) {
    console.error("❌ Respuesta inesperada de Gemini:", result);
    process.exit(1);
  }

  // ── Aplicar clasificaciones ─────────────────────────────────────────────────
  const classMap = new Map(
    result.classifications.map((c) => [c.id, c.difficulty]),
  );

  let updated = 0;
  const finalQuestions = questions.map((q) => {
    if (!classMap.has(q.id)) return q;
    const newDiff = classMap.get(q.id);
    if (![1, 2, 3].includes(newDiff)) {
      console.warn(
        `⚠️  ID ${q.id}: dificultad inválida "${newDiff}", se ignora.`,
      );
      return q;
    }
    updated++;
    return { ...q, difficulty: newDiff };
  });

  // ── Escribir resultado ──────────────────────────────────────────────────────
  fs.writeFileSync(
    QUESTIONS_PATH,
    JSON.stringify(finalQuestions, null, 2),
    "utf-8",
  );
  console.log(`✅ ${updated} preguntas actualizadas en ${QUESTIONS_PATH}`);

  // Mostrar resumen
  const byLevel = finalQuestions.reduce((acc, q) => {
    const d = q.difficulty ?? "?";
    acc[d] = (acc[d] ?? 0) + 1;
    return acc;
  }, {});
  console.table(
    Object.entries(byLevel).map(([level, count]) => ({
      nivel:
        level === "1"
          ? "Básico"
          : level === "2"
            ? "Intermedio"
            : level === "3"
              ? "Avanzado"
              : "Sin asignar",
      preguntas: count,
    })),
  );
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
