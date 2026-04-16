import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/api/axios'

export const useRewardsStore = defineStore('rewards', () => {
  // --- Configuración ---
  const baseReward = 10
  const MAX_REWARD = 100
  const BASE_BONUS_PERCENTAGE = 5
  const BONUS_INCREMENT = 5
  const BONUS_MULTIPLIERS = [1.2, 1.5, 2, 4, 8]

  // --- Estado ---
  const streak = ref(0)
  const claimed = ref(false)
  const ready = ref(false)
  const activityCoinsEarned = ref(0)
  const hasBonus = ref(false)
  const currentMultiplier = ref(1)

  // --- Getters Computados ---
  const calculateReward = (s) => Math.min(Math.round(baseReward * (s + 1)), MAX_REWARD)
  const todayReward = computed(() => calculateReward(streak.value))

  const rewardClaim = computed(() => ({
    day: streak.value + 1,
    reward: todayReward.value,
    claimed: claimed.value,
  }))

  const previousReward = computed(() => {
    if (streak.value === 0) return { day: '-', reward: '-' }
    return { day: streak.value, reward: calculateReward(streak.value - 1) }
  })

  const nextReward = computed(() => ({
    day: streak.value + 2,
    reward: calculateReward(streak.value + 1),
  }))

  // --- Helpers de Bonus (Acceso a authStore) ---
  function getBonusPercentage() {
    const authStore = useAuthStore()
    return authStore.userData?.bonusPercentage ?? BASE_BONUS_PERCENTAGE
  }

  function setBonusPercentage(value) {
    const authStore = useAuthStore()
    if (authStore.userData) {
      authStore.userData.bonusPercentage = value
    }
  }

  // --- Acciones con API ---

  async function fetchRewards() {
    try {
      const { data } = await api.get('/rewards')
      streak.value = data.streak
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
      await authStore.fetchMe() // Sincroniza el perfil completo
    } catch (error) {
      console.error('Error claiming reward:', error.response?.data)
      throw error
    }
  }

  // Evalúa la suerte del bonus y lo persiste en la BBDD
  async function evaluateBonus() {
  const authStore = useAuthStore()
    const current = getBonusPercentage()
    const rand = Math.random() * 100

    if (rand <= current) {
      const idx = Math.floor(Math.random() * BONUS_MULTIPLIERS.length)
      currentMultiplier.value = BONUS_MULTIPLIERS[idx]
      hasBonus.value = true
      setBonusPercentage(BASE_BONUS_PERCENTAGE)
    } else {
      hasBonus.value = false
      currentMultiplier.value = 1
      const next = Math.min(current + BONUS_INCREMENT, 100)
      setBonusPercentage(next)
    }
  // En rewards.store.js
try {
  const userId = authStore.user.id;
  const currentBonus = getBonusPercentage();
  const currentCoins = authStore.userData?.coins || 0;

  // Enviamos los datos dentro del objeto 'userData'
  await api.put(`/users/${userId}`, {
    userData: {
      bonusPercentage: currentBonus,
      coins: currentCoins
    }
  });
  
  console.log("Sincronización con BD exitosa");
} catch (error) {
  console.error("Error al persistir:", error);
}
    return { hasBonus: hasBonus.value, multiplier: currentMultiplier.value }
  }

  async function claimActivityReward(amount) {
  if (amount <= 0) return { baseAmount: 0, multiplier: 1, totalAmount: 0 }

  try {
    const multiplier = hasBonus.value ? currentMultiplier.value : 1
    const totalAmount = Math.round(amount * multiplier)
    const authStore = useAuthStore()

    if (authStore.userData) {
      // Actualización local
      authStore.userData.coins = (authStore.userData.coins ?? 0) + totalAmount

      // PERSISTENCIA REAL EN BD
      await api.put(`/users/${authStore.user.id}`, {
        userData: {
          coins: authStore.userData.coins,
          bonus_percentage: authStore.userData.bonusPercentage

        }
      })
    }
    return { baseAmount: amount, multiplier, totalAmount }
  } catch (error) {
    console.error('Error al guardar monedas:', error)
    throw error
  }
}

  return {
    streak, claimed, ready, activityCoinsEarned,
    todayReward, rewardClaim, previousReward, nextReward,
    fetchRewards, claimReward, claimActivityReward,
    hasBonus, currentMultiplier, evaluateBonus, getBonusPercentage
  }
})