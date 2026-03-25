import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/api/axios'

export const useRewardsStore = defineStore('rewards', () => {
  const baseReward = 10
  const MAX_REWARD = 100

  const streak = ref(0)
  const claimed = ref(false)

  // --- Lógica de cálculo dinámico ---
  
  // Función auxiliar para no repetir la fórmula matemática
  const calculateReward = (s) => Math.min(Math.round(baseReward * (s + 1)), MAX_REWARD)

  const todayReward = computed(() => calculateReward(streak.value))

  // Representa el estado actual para la UI
  const rewardClaim = computed(() => ({
    day: streak.value + 1,
    reward: todayReward.value,
    claimed: claimed.value
  }))

  const previousReward = computed(() => {
    if (streak.value === 0) return { day: '-', reward: '-' }
    return {
      day: streak.value,
      reward: calculateReward(streak.value - 1)
    }
  })

  const nextReward = computed(() => ({
    day: streak.value + 2,
    reward: calculateReward(streak.value + 1)
  }))

  // --- Acciones ---

  async function fetchRewards() {
    try {
      const { data } = await api.get('/rewards')
      streak.value = data.streak
      claimed.value = data.claimedToday
    } catch (error) {
      console.error("Error fetching rewards:", error)
    }
  }

  async function claimReward() {
    // Si ya reclamó hoy, evitamos la ejecución
    if (claimed.value) return

    try {
      await api.post('/rewards/claim', { amount: todayReward.value })

      claimed.value = true
      streak.value += 1 // Incrementamos la racha localmente

      const authStore = useAuthStore()
      await authStore.fetchMe()
    } catch (error) {
      console.error("Error claiming reward:", error)
    }
  }

  return { streak, claimed, todayReward, rewardClaim, previousReward, nextReward, fetchRewards, claimReward }
})