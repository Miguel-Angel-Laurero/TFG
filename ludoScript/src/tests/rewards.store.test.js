import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useRewardsStore } from '@/stores/rewards.store'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('@/api/axios', () => ({
  default: {
    get:  vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    fetchMe: vi.fn(),
  })),
}))

import api from '@/api/axios'
import { useAuthStore } from '@/stores/auth.store'

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('rewards.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── Initial state ─────────────────────────────────────────────────────────

  it('starts with streak=0, claimed=false, ready=false', () => {
    const store = useRewardsStore()
    expect(store.streak).toBe(0)
    expect(store.claimed).toBe(false)
    expect(store.ready).toBe(false)
  })

  // ── calculateReward ───────────────────────────────────────────────────────

  it('todayReward equals baseReward * (streak + 1) capped at 100', () => {
    const store = useRewardsStore()
    store.streak = 0
    expect(store.todayReward).toBe(10)   // 10 * 1

    store.streak = 4
    expect(store.todayReward).toBe(50)   // 10 * 5

    store.streak = 9
    expect(store.todayReward).toBe(100)  // 10 * 10 = 100

    store.streak = 20
    expect(store.todayReward).toBe(100)  // capped at MAX_REWARD
  })

  // ── rewardClaim computed ──────────────────────────────────────────────────

  it('rewardClaim.day is streak + 1', () => {
    const store = useRewardsStore()
    store.streak = 5
    expect(store.rewardClaim.day).toBe(6)
  })

  it('rewardClaim.claimed mirrors the claimed flag', () => {
    const store = useRewardsStore()
    store.claimed = true
    expect(store.rewardClaim.claimed).toBe(true)
  })

  // ── previousReward computed ───────────────────────────────────────────────

  it('previousReward shows dash when streak is 0', () => {
    const store = useRewardsStore()
    store.streak = 0
    expect(store.previousReward.day).toBe('-')
    expect(store.previousReward.reward).toBe('-')
  })

  it('previousReward shows correct values when streak > 0', () => {
    const store = useRewardsStore()
    store.streak = 3
    expect(store.previousReward.day).toBe(3)
    expect(store.previousReward.reward).toBe(30) // 10 * (3-1+1) = 10*3 = 30
  })

  // ── nextReward computed ───────────────────────────────────────────────────

  it('nextReward shows day streak + 2', () => {
    const store = useRewardsStore()
    store.streak = 2
    expect(store.nextReward.day).toBe(4)
    expect(store.nextReward.reward).toBe(40) // 10 * (2+1+1) = 10*4 = 40
  })

  // ── fetchRewards ──────────────────────────────────────────────────────────

  it('fetchRewards: updates streak and claimed from API', async () => {
    api.get.mockResolvedValueOnce({ data: { streak: 7, claimedToday: true } })
    const store = useRewardsStore()
    await store.fetchRewards()

    expect(store.streak).toBe(7)
    expect(store.claimed).toBe(true)
    expect(store.ready).toBe(true)
  })

  it('fetchRewards: marks ready even when API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('Network error'))
    const store = useRewardsStore()
    await store.fetchRewards()

    expect(store.ready).toBe(true)
    expect(store.streak).toBe(0) // unchanged
  })

  // ── claimReward ───────────────────────────────────────────────────────────

  it('claimReward: does nothing if already claimed', async () => {
    const store = useRewardsStore()
    store.claimed = true
    await store.claimReward()

    expect(api.post).not.toHaveBeenCalled()
  })

  it('claimReward: posts to /rewards/claim and refreshes data on success', async () => {
    api.post.mockResolvedValueOnce({})
    api.get.mockResolvedValueOnce({ data: { streak: 1, claimedToday: true } })
    const mockFetchMe = vi.fn()
    useAuthStore.mockReturnValueOnce({ fetchMe: mockFetchMe })

    const store = useRewardsStore()
    store.streak = 0
    await store.claimReward()

    expect(api.post).toHaveBeenCalledWith('/rewards/claim', { amount: 10 })
    expect(store.claimed).toBe(true)
  })

  it('claimReward: throws when API fails', async () => {
    api.post.mockRejectedValueOnce(new Error('Server error'))
    const store = useRewardsStore()
    await expect(store.claimReward()).rejects.toThrow('Server error')
  })
})
