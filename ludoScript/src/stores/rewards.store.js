import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/api/axios'

export const useRewardsStore = defineStore('rewards', () => {
  const baseReward = 10
  const MAX_REWARD = 100

  const streak  = ref(0)
  const claimed = ref(false)
  const ready   = ref(false)
  // Monedas acumuladas en la sesión por actividades (no persiste entre recargas,
  // el saldo real vive en authStore.userData)
  const activityCoinsEarned = ref(0)

  const calculateReward = (s) => Math.min(Math.round(baseReward * (s + 1)), MAX_REWARD)

  const todayReward = computed(() => calculateReward(streak.value))

  const rewardClaim = computed(() => ({
    day:     streak.value + 1,
    reward:  todayReward.value,
    claimed: claimed.value,
  }))

  const previousReward = computed(() => {
    if (streak.value === 0) return { day: '-', reward: '-' }
    return { day: streak.value, reward: calculateReward(streak.value - 1) }
  })

  const nextReward = computed(() => ({
    day:    streak.value + 2,
    reward: calculateReward(streak.value + 1),
  }))

  async function fetchRewards() {
    try {
      const { data } = await api.get('/rewards')
      streak.value  = data.streak
      claimed.value = data.claimedToday
    } catch (error) {
      console.error('Error fetching rewards:', error)
    } finally {
      ready.value = true
    }
  }

  async function claimReward() {
    if (claimed.value) return
    try {
      await api.post('/rewards/claim', { amount: todayReward.value })
      await fetchRewards()
      const authStore = useAuthStore()
      await authStore.fetchMe()
    } catch (error) {
      console.error('Error claiming reward:', error.response?.data)
      throw error
    }
  }

  // ─── Recompensa por actividad ─────────────────────────────────────────────
  // Por ahora gestionado en el frontend: suma las monedas al saldo del usuario
  // en authStore sin llamada al backend. Cuando el backend esté listo bastará
  // con reemplazar el cuerpo de esta función por una llamada a la API.
  async function claimActivityReward(amount) {
    if (amount <= 0) return
    try {
      activityCoinsEarned.value += amount
      const authStore = useAuthStore()
      // Actualiza el saldo local optimistamente mientras no hay backend
      if (authStore.userData) {
        authStore.userData.coins = (authStore.userData.coins ?? 0) + amount
      }
    } catch (error) {
      console.error('Error claiming activity reward:', error)
      throw error
    }
  }

  return {
    streak, claimed, ready, activityCoinsEarned,
    todayReward, rewardClaim, previousReward, nextReward,
    fetchRewards, claimReward, claimActivityReward,
  }
})