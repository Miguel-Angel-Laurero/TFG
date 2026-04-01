// composables/useActivityReward.js
// ─────────────────────────────────────────────────────────────────────────────
// Composable GENÉRICO que gestiona la recompensa al completar una actividad.
//
// Cualquier actividad puede usarlo:
//   - Sin puntuación (Flashcards): solo recompensa base
//   - Con puntuación (Quiz):       base + bonus según rango
//
// Uso básico (sin puntuación):
//   const { earnedReward, grantReward } = useActivityReward({ base: 20 })
//   await grantReward()   // al completar la actividad
//
// Uso con bonus:
//   const { earnedReward, grantReward } = useActivityReward({
//     base: 20,
//     bonusByRank: { suspenso: 0, aprobado: 10, notable: 20, sobresaliente: 40 }
//   })
//   await grantReward('notable')
// ─────────────────────────────────────────────────────────────────────────────
import { ref } from 'vue'
import { useRewardsStore } from '@/stores/rewards.store'

/**
 * @typedef {Object} ActivityRewardOptions
 * @property {number} base                          - Monedas base por completar
 * @property {Record<string, number>} [bonusByRank] - Bonus adicional por rango
 */

/**
 * @param {ActivityRewardOptions} options
 */
export function useActivityReward({ base, bonusByRank = {} }) {
  const rewardsStore = useRewardsStore()

  // Recompensa total obtenida en esta sesión (base + bonus)
  const earnedReward = ref(0)
  // Rango alcanzado (null si la actividad no tiene puntuación)
  const earnedRank   = ref(null)

  /**
   * Calcula y registra la recompensa.
   * @param {string|null} rank - Clave del rango (debe existir en bonusByRank)
   */
  async function grantReward(rank = null) {
    const bonus = rank && bonusByRank[rank] != null ? bonusByRank[rank] : 0
    const total = base + bonus

    earnedReward.value = total
    earnedRank.value   = rank

    await rewardsStore.claimActivityReward(total)
  }

  return { earnedReward, earnedRank, grantReward }
}