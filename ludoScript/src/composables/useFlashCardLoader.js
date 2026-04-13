// composables/useFlashCardLoader.js
// ─────────────────────────────────────────────────────────────────────────────
// Utilidades puras para la carga y transformación de flashcards.
// Separadas del componente para poder ser probadas de forma aislada.
// ─────────────────────────────────────────────────────────────────────────────

export const QUIZ_URL = "/quizQuestions.json";
export const FLASH_CARDS_PER_SESSION = 15;

/**
 * Transforma una pregunta del banco del Quiz en una flashcard.
 * @param {{ question: string, options: string[], correct: number, id?: number, category?: string, topic?: string, difficulty?: number }} q
 * @returns {{ question: string, answer: string, id: number|null, category: string|null, topic: string|null, difficulty: number|null }}
 */
export function toFlashCard(q) {
  return {
    question: q.question,
    answer: q.options[q.correct],
    id: q.id ?? null,
    category: q.category ?? null,
    topic: q.topic ?? null,
    difficulty: q.difficulty ?? null,
  };
}

/**
 * Devuelve hasta n elementos aleatorios únicos sin modificar el array original.
 * Si n >= arr.length, devuelve todos los elementos barajados.
 * @template T
 * @param {T[]} arr
 * @param {number} n
 * @returns {T[]}
 */
export function pickRandom(arr, n) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy.slice(0, n);
}
