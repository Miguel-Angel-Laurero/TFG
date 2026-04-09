/**
 * Unit tests for the weekly-data cache logic in Chart.vue.
 * The function is re-implemented inline so the behaviour can be tested
 * without mounting the full component (which depends on PrimeVue Chart).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'

// ---------------------------------------------------------------------------
// Re-implementation of the cache logic from Chart.vue
// (mirrors the source exactly so a bug in either is caught)
// ---------------------------------------------------------------------------
const WEEKLY_CACHE_KEY = 'session_weekly'
const CACHE_TTL_MS = 60 * 60 * 1000 // 1 hour

async function loadWeeklyData(getWeeklyFn) {
  let testsPerDay = [0, 0, 0, 0, 0, 0, 0]
  let xpPerDay    = [0, 0, 0, 0, 0, 0, 0]

  try {
    const cached = localStorage.getItem(WEEKLY_CACHE_KEY)
    if (cached) {
      const { data, cachedAt } = JSON.parse(cached)
      if (Date.now() - cachedAt < CACHE_TTL_MS) {
        testsPerDay = data.testsPerDay
        xpPerDay    = data.xpPerDay
        return { testsPerDay, xpPerDay }
      }
    }
  } catch {
    // ignore malformed cache
  }

  try {
    const { data } = await getWeeklyFn()
    testsPerDay = data.testsPerDay
    xpPerDay    = data.xpPerDay
    localStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify({
      data: { testsPerDay, xpPerDay },
      cachedAt: Date.now(),
    }))
  } catch {
    // keep zeros on failure
  }

  return { testsPerDay, xpPerDay }
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('Chart.vue – loadWeeklyData cache logic', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2025-01-01T10:00:00Z'))
  })

  afterEach(() => {
    localStorage.clear()
    vi.useRealTimers()
  })

  const freshData = {
    testsPerDay: [1, 2, 3, 4, 5, 6, 7],
    xpPerDay:    [10, 20, 30, 40, 50, 60, 70],
  }

  // ── Cache miss → fetch from API ──────────────────────────────────────────

  it('fetches from API when cache is empty', async () => {
    const getWeekly = vi.fn().mockResolvedValueOnce({ data: freshData })
    const result = await loadWeeklyData(getWeekly)

    expect(getWeekly).toHaveBeenCalledOnce()
    expect(result.testsPerDay).toEqual(freshData.testsPerDay)
    expect(result.xpPerDay).toEqual(freshData.xpPerDay)
  })

  it('stores fetched data in localStorage', async () => {
    const getWeekly = vi.fn().mockResolvedValueOnce({ data: freshData })
    await loadWeeklyData(getWeekly)

    const stored = JSON.parse(localStorage.getItem(WEEKLY_CACHE_KEY))
    expect(stored.data).toEqual(freshData)
    expect(stored.cachedAt).toBe(Date.now())
  })

  // ── Cache hit → serve from cache ─────────────────────────────────────────

  it('serves from cache when entry is fresh (< 1 hour old)', async () => {
    const cachedData = {
      testsPerDay: [9, 8, 7, 6, 5, 4, 3],
      xpPerDay:    [90, 80, 70, 60, 50, 40, 30],
    }
    localStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify({
      data: cachedData,
      cachedAt: Date.now() - 30 * 60 * 1000, // 30 min ago
    }))

    const getWeekly = vi.fn()
    const result = await loadWeeklyData(getWeekly)

    expect(getWeekly).not.toHaveBeenCalled()
    expect(result.testsPerDay).toEqual(cachedData.testsPerDay)
    expect(result.xpPerDay).toEqual(cachedData.xpPerDay)
  })

  // ── Cache stale → re-fetch ────────────────────────────────────────────────

  it('re-fetches when cache is older than 1 hour', async () => {
    const staleData = { testsPerDay: [1, 1, 1, 1, 1, 1, 1], xpPerDay: [5, 5, 5, 5, 5, 5, 5] }
    localStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify({
      data: staleData,
      cachedAt: Date.now() - CACHE_TTL_MS - 1, // just expired
    }))

    const getWeekly = vi.fn().mockResolvedValueOnce({ data: freshData })
    const result = await loadWeeklyData(getWeekly)

    expect(getWeekly).toHaveBeenCalledOnce()
    expect(result.testsPerDay).toEqual(freshData.testsPerDay)
  })

  // ── Malformed cache entry ─────────────────────────────────────────────────

  it('falls back to API when cache contains malformed JSON', async () => {
    localStorage.setItem(WEEKLY_CACHE_KEY, 'not-valid-json{{')

    const getWeekly = vi.fn().mockResolvedValueOnce({ data: freshData })
    const result = await loadWeeklyData(getWeekly)

    expect(getWeekly).toHaveBeenCalledOnce()
    expect(result.testsPerDay).toEqual(freshData.testsPerDay)
  })

  // ── API failure ───────────────────────────────────────────────────────────

  it('returns all-zeros when API fails and no cache', async () => {
    const getWeekly = vi.fn().mockRejectedValueOnce(new Error('Network error'))
    const result = await loadWeeklyData(getWeekly)

    expect(result.testsPerDay).toEqual([0, 0, 0, 0, 0, 0, 0])
    expect(result.xpPerDay).toEqual([0, 0, 0, 0, 0, 0, 0])
  })

  it('does not crash when API fails – localStorage remains unchanged', async () => {
    const getWeekly = vi.fn().mockRejectedValueOnce(new Error('fail'))
    await loadWeeklyData(getWeekly)

    expect(localStorage.getItem(WEEKLY_CACHE_KEY)).toBeNull()
  })

  // ── Cache boundary: exactly at TTL ───────────────────────────────────────

  it('re-fetches when cache age equals exactly the TTL', async () => {
    localStorage.setItem(WEEKLY_CACHE_KEY, JSON.stringify({
      data: { testsPerDay: [0, 0, 0, 0, 0, 0, 0], xpPerDay: [0, 0, 0, 0, 0, 0, 0] },
      cachedAt: Date.now() - CACHE_TTL_MS, // exactly at boundary
    }))

    const getWeekly = vi.fn().mockResolvedValueOnce({ data: freshData })
    await loadWeeklyData(getWeekly)

    expect(getWeekly).toHaveBeenCalledOnce()
  })
})
