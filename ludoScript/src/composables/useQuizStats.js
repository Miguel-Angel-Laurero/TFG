// composables/useQuizStats.js
// ─────────────────────────────────────────────────────────────────────────────
// Lógica de puntuación EXCLUSIVA del Quiz. No aplica a otras actividades.
//
// Recibe el array reactivo `results` (null | true | false) y el total de
// preguntas como ComputedRef, y devuelve los contadores y la nota formateada.
// ─────────────────────────────────────────────────────────────────────────────
import { computed } from 'vue'

/**
 * @param {import('vue').Ref<(boolean|null)[]>}  results
 * @param {import('vue').ComputedRef<number>}    totalItems
 */
export function useQuizStats(results, totalItems) {
  const correctCount    = computed(() => results.value.filter(r => r === true).length)
  const wrongCount      = computed(() => results.value.filter(r => r === false).length)
  const unansweredCount = computed(() => results.value.filter(r => r === null).length)
  const totalCount = computed(() => results.value.length)
  // Fórmula tipo test: aciertos − (errores / 3). Nunca negativa.
const score = computed(() => {
  const netPoints = correctCount.value - (wrongCount.value / 3);
  const finalScore = (netPoints / totalCount.value) * 10;
  console.log(netPoints,totalCount.value, finalScore)
  return Math.max(0, finalScore);
});

  const scoreFormatted = computed(() => score.value.toFixed(2))

  const scoreColor = computed(() => {
    const pct = score.value / totalItems.value
    if (pct >= 0.9) return 'text-emerald-400'
    if (pct >= 0.5) return 'text-yellow-400'
    return 'text-red-400'
  })

  return { correctCount, wrongCount, unansweredCount, scoreFormatted, scoreColor, score }
}
