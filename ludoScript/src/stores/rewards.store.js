import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import api from '@/api/axios'  // ← importar axios

export const useRewardsStore = defineStore('rewards', () => {
  const baseReward = 10
  const MAX_REWARD = 100

  const streak  = ref(0)
  const claimed = ref(false)
  const rewardsList = ref([])

  const todayReward = computed(() =>
    Math.min(Math.round(baseReward * streak.value), MAX_REWARD)
  )

  const currentIndex   = computed(() => rewardsList.value.findIndex(r => !r.claimed))
  const rewardClaim    = computed(() => rewardsList.value[currentIndex.value])
  const previousReward = computed(() => rewardsList.value[currentIndex.value - 1] ?? { day: '-', reward: '-' })
  const nextReward     = computed(() => rewardsList.value[currentIndex.value + 1] ?? { day: '-', reward: '-' })

  async function fetchRewards() {
    const { data } = await api.get('/rewards')
    rewardsList.value = data.rewards
    streak.value = data.streak
    claimed.value = data.claimedToday
  }

  async function claimReward() {
    if (!rewardClaim.value) return

    await api.post('/rewards/claim', { amount: todayReward.value })

    rewardsList.value[currentIndex.value].claimed = true
    claimed.value = true

    const authStore = useAuthStore()
    await authStore.fetchMe()
  }

  return { streak, claimed, todayReward, rewardClaim, previousReward, nextReward, fetchRewards, claimReward }
})