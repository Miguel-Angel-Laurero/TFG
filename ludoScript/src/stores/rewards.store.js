import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useRewardsStore = defineStore('rewards', () => {
  const baseReward = 10
  const MAX_REWARD = 100

  const streak  = ref(7)
  const claimed = ref(false)
  const rewardsList = ref([])

  // Cálculo exponencial del reward de hoy
  const todayReward = computed(() =>
    Math.min(Math.round(baseReward * streak.value), MAX_REWARD)
  )

  const currentIndex   = computed(() => rewardsList.value.findIndex(r => !r.claimed))
  const rewardClaim    = computed(() => rewardsList.value[currentIndex.value])
  const previousReward = computed(() => rewardsList.value[currentIndex.value - 1] ?? { day: '-', reward: '-' })
  const nextReward     = computed(() => rewardsList.value[currentIndex.value + 1] ?? { day: '-', reward: '-' })

  async function fetchRewards() {
    const res  = await fetch('/api/rewards')
    const data = await res.json()
    rewardsList.value = data.rewards
    streak.value      = data.streak
    claimed.value     = data.claimedToday
  }

  async function claimReward() {
    if (!rewardClaim.value) return

    await fetch('/api/rewards/claim', {
      method: 'POST',
      body: JSON.stringify({ day: rewardClaim.value.day, amount: todayReward.value })
    })

    rewardsList.value[currentIndex.value].claimed = true
    claimed.value = true
  }

  return { streak, claimed, todayReward, rewardClaim, previousReward, nextReward, fetchRewards, claimReward }
})