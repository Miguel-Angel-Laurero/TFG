// composables/useQuizReward.js
// ─────────────────────────────────────────────────────────────────────────────
// Extiende useActivityReward con la lógica de rangos propia del Quiz.
//
// Rangos:
//   Suspenso      → pct < 0.50  → +0  monedas
//   Aprobado      → pct < 0.70  → +10 monedas
//   Notable       → pct < 0.90  → +20 monedas
//   Sobresaliente → pct >= 0.90 → +40 monedas
//
// Uso en Quiz.vue:
//   const { earnedReward, earnedRank, rankLabel, grantQuizReward } = useQuizReward()
//   await grantQuizReward(score, totalQuestions)   // al llegar al 100%
// ─────────────────────────────────────────────────────────────────────────────
import { computed } from 'vue'
import { useActivityReward } from '@/composables/useActivityReward'

const QUIZ_BASE = 50

const BONUS_BY_RANK = {
  suspenso:      0,
  aprobado:      20,
  notable:       35,
  sobresaliente: 50,
}

const RANK_LABELS = {
  suspenso:      'Suspenso',
  aprobado:      'Aprobado',
  notable:       'Notable',
  sobresaliente: 'Sobresaliente',
}

const RANK_COLORS = {
  suspenso:      'text-red-400',
  aprobado:      'text-yellow-400',
  notable:       'text-emerald-400',
  sobresaliente: 'text-cyan-400',
}

function calcRank(score, total) {
  const pct = total > 0 ? score / total : 0
  if (pct >= 0.9) return 'sobresaliente'
  if (pct >= 0.7) return 'notable'
  if (pct >= 0.5) return 'aprobado'
  return 'suspenso'
}

export function useQuizReward() {
  const { earnedReward, earnedRank, grantReward } = useActivityReward({
    base:        QUIZ_BASE,
    bonusByRank: BONUS_BY_RANK,
  })

  const rankLabel = computed(() => earnedRank.value ? RANK_LABELS[earnedRank.value] : null)
  const rankColor = computed(() => earnedRank.value ? RANK_COLORS[earnedRank.value] : null)

  /**
   * @param {number} score  - Puntuación obtenida (con penalización ya aplicada)
   * @param {number} total  - Número total de preguntas (máximo posible)
   */
  async function grantQuizReward(score, total) {
    const rank = calcRank(score, total)
    await grantReward(rank)
  }

  return { earnedReward, earnedRank, rankLabel, rankColor, grantQuizReward }
}