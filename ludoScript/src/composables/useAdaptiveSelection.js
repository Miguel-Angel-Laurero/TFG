// composables/useAdaptiveSelection.js
// ─────────────────────────────────────────────────────────────────────────────
// Responsabilidades:
//   1. Cálculo del algoritmo de pesos (error rate por categoría)
//   2. Selección aleatoria de N preguntas sin repetición (Fisher-Yates)
//   3. Gestión del localStorage para preguntas de PDF
//      - Guardar las 50 preguntas generadas
//      - Calcular y guardar los 15 IDs activos
//      - Leer / limpiar / marcar como guardado en la nube
// ─────────────────────────────────────────────────────────────────────────────

// ── Claves de localStorage ────────────────────────────────────────────────────
const lsPdfQuestions = (id) => `ludoscript_pdf_questions_${id}`;
const lsPdfActiveIds = (id) => `ludoscript_pdf_active_ids_${id}`;
const lsPdfCloudSaved = (id) => `ludoscript_pdf_cloud_saved_${id}`;

// ── Algoritmo de Fisher-Yates  ────────────────────────────────────────────────
// Baraja una copia del array de forma uniform en O(n).
function fisherYates(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// ── Selección aleatoria única ──────────────────────────────────────────────────
// Elige n IDs distintos del array de preguntas usando Fisher-Yates.
// Si questions.length < n, devuelve todos los IDs disponibles.
function pickRandomIds(questions, n = 15) {
  const shuffled = fisherYates(questions);
  return shuffled.slice(0, Math.min(n, shuffled.length)).map((q) => q.id);
}

// ── Filtro por IDs ────────────────────────────────────────────────────────────
// Devuelve solo las preguntas cuyo id está en el conjunto dado.
function filterByIds(questions, ids) {
  const set = new Set(ids);
  return questions.filter((q) => set.has(q.id));
}

// ── Algoritmo de pesos ────────────────────────────────────────────────────────
// Calcula la tasa de error por categoría y devuelve la lista ordenada
// de la más débil a la más fuerte.
//
// @param {Array<{ category, correct, total }>} stats - estadísticas de la BD
// @param {number} minTotal - umbral mínimo de intentos para considerar la categoría
// @returns {Array<{ category, errorRate, correct, total }>}
function calculateWeakCategories(stats, minTotal = 5) {
  return stats
    .filter((s) => s.total >= minTotal)
    .map((s) => ({
      category: s.category,
      errorRate: (s.total - s.correct) / s.total,
      correct: s.correct,
      total: s.total,
    }))
    .sort((a, b) => b.errorRate - a.errorRate);
}

// ── CSS badge por tasa de error ───────────────────────────────────────────────
// Devuelve las clases Tailwind para colorear el chip de categoría según su severidad.
function errorRateBadgeClass(errorRate) {
  if (errorRate >= 0.6)
    return "bg-red-500/20 border border-red-500/40 text-red-300";
  if (errorRate >= 0.35)
    return "bg-amber-500/20 border border-amber-500/40 text-amber-300";
  return "bg-indigo-500/20 border border-indigo-500/40 text-indigo-300";
}

// Convierte un slug kebab-case en texto legible ("scope-variables" → "Scope Variables")
function formatCategoryLabel(category) {
  return category
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

// ── Gestión localStorage de preguntas PDF ─────────────────────────────────────

/**
 * Guarda las 50 preguntas y 20 flashcards en localStorage y genera 15 IDs activos.
 * @returns {number[]} IDs activos generados
 */
function savePdfQuestionsToStorage(pdfId, questions, flashCards) {
  try {
    const activeIds = pickRandomIds(questions, 15);
    localStorage.setItem(
      lsPdfQuestions(pdfId),
      JSON.stringify({ questions, flashCards }),
    );
    localStorage.setItem(lsPdfActiveIds(pdfId), JSON.stringify(activeIds));
    return activeIds;
  } catch {
    return [];
  }
}

/**
 * Carga las preguntas, flashcards e IDs activos desde localStorage.
 * Devuelve null si no hay datos guardados para ese PDF.
 */
function loadPdfQuestionsFromStorage(pdfId) {
  try {
    const raw = localStorage.getItem(lsPdfQuestions(pdfId));
    const idsRaw = localStorage.getItem(lsPdfActiveIds(pdfId));
    if (!raw || !idsRaw) return null;
    const { questions, flashCards } = JSON.parse(raw);
    const activeIds = JSON.parse(idsRaw);
    return { questions, flashCards, activeIds };
  } catch {
    return null;
  }
}

/** Elimina todos los datos locales de un PDF (al borrar o al desvincular). */
function removePdfFromStorage(pdfId) {
  localStorage.removeItem(lsPdfQuestions(pdfId));
  localStorage.removeItem(lsPdfActiveIds(pdfId));
  localStorage.removeItem(lsPdfCloudSaved(pdfId));
}

/** Comprueba si hay datos locales para un PDF. */
function hasPdfInStorage(pdfId) {
  return !!localStorage.getItem(lsPdfQuestions(pdfId));
}

/** Comprueba si las preguntas de un PDF ya fueron guardadas en la nube. */
function isPdfSavedToCloud(pdfId) {
  return localStorage.getItem(lsPdfCloudSaved(pdfId)) === "true";
}

/** Marca localmente que las preguntas de un PDF ya están guardadas en la nube. */
function markPdfAsSavedToCloud(pdfId) {
  try {
    localStorage.setItem(lsPdfCloudSaved(pdfId), "true");
  } catch {
    // quota exceeded: ignorar silenciosamente
  }
}

// ── Sincronización desde servidor ────────────────────────────────────────────
/**
 * Hidrata el localStorage con los PDFs descargados del servidor al iniciar sesión.
 * Solo escribe datos para los PDFs que NO tienen datos locales aún, preservando
 * cualquier cambio local del usuario (regeneraciones no guardadas en la nube).
 *
 * @param {Array<{ id, quizQuestions, flashCards }>} pdfs - PDFs devueltos por /api/pdfs/sync
 */
function syncPdfsFromServer(pdfs) {
  if (!Array.isArray(pdfs)) return;
  for (const pdf of pdfs) {
    if (!pdf.quizQuestions || !pdf.flashCards) continue;
    // Si ya hay datos locales, el usuario puede tener cambios sin guardar: no sobrescribir
    if (hasPdfInStorage(pdf.id)) continue;
    savePdfQuestionsToStorage(pdf.id, pdf.quizQuestions, pdf.flashCards);
    markPdfAsSavedToCloud(pdf.id);
  }
}

export {
  fisherYates,
  pickRandomIds,
  filterByIds,
  calculateWeakCategories,
  errorRateBadgeClass,
  formatCategoryLabel,
  savePdfQuestionsToStorage,
  loadPdfQuestionsFromStorage,
  removePdfFromStorage,
  hasPdfInStorage,
  isPdfSavedToCloud,
  markPdfAsSavedToCloud,
  syncPdfsFromServer,
};
