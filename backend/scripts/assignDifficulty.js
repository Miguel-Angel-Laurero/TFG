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

  const prompt = `Eres un experto evaluador de contenido educativo de JavaScript. Tu tarea es clasificar preguntas de quiz según la profundidad conceptual que requieren para ser respondidas correctamente.

## Niveles de dificultad

**1 = Básico**
El alumno solo necesita recordar o reconocer una definición o regla directa.
- Se responde con conocimiento de primer nivel ("¿qué es X?", "¿qué hace Y?")
- No requiere razonamiento sobre comportamiento implícito del lenguaje
- El concepto está documentado de forma explícita en cualquier tutorial introductorio
- Ejemplo de pregunta básica: "¿Qué hace el operador === en comparación con ==?" → respuesta directa, sin ambigüedad

**2 = Intermedio**
El alumno debe entender POR QUÉ ocurre algo, no solo QUÉ ocurre.
- Requiere conocer mecanismos internos: coerción implícita, hoisting, scope, event loop, prototype chain
- El alumno debe razonar sobre el comportamiento en un contexto específico
- La respuesta incorrecta parece plausible si solo se conoce la definición superficial
- Ejemplo de pregunta intermedia: "¿Qué devuelve `typeof null`? ¿Por qué?"

**3 = Avanzado**
El alumno debe aplicar varios conceptos simultáneamente o conocer un comportamiento edge/no intuitivo.
- Casos donde el resultado sorprende incluso a desarrolladores con experiencia
- Requiere entender interacciones entre conceptos (closures + async, prototype + this, etc.)
- Implica conocimiento del runtime, especificación ECMAScript, o patrones avanzados
- Ejemplo de pregunta avanzada: "¿Qué imprime este código con closures en un bucle var?"

## Criterios de clasificación — IMPORTANTE

IGNORA completamente:
- La redacción o tono de la pregunta ("si repasas...", "en una revisión de código...", "¿cuál es la opción más precisa?")
- Si la pregunta menciona un escenario laboral o académico
- La longitud de la pregunta o las opciones

EVALÚA únicamente:
- ¿Qué nivel de comprensión necesita el alumno para elegir la respuesta correcta?
- ¿Es suficiente con memorizar la definición (1) o hay que entender el mecanismo (2) o casos edge (3)?
- Si dos preguntas sobre el mismo concepto tienen el mismo nivel de comprensión requerido → MISMO nivel de dificultad

## Preguntas a clasificar

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
