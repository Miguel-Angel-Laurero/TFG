import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useTransactionStore } from '@/stores/transaction.store'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('@/stores/auth.store', () => ({
  useAuthStore: vi.fn(() => ({
    userData: { coins: 1000 },
  })),
}))

vi.mock('@/router/router', () => ({ default: { push: vi.fn() } }))

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('transaction.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // ── Initial state ─────────────────────────────────────────────────────────

  it('initialises coins from auth userData', () => {
    const store = useTransactionStore()
    expect(store.coins).toBe(1000)
  })

  it('initialises items as an empty array', () => {
    const store = useTransactionStore()
    expect(store.items).toEqual([])
  })

  it('initialises coins to 0 when userData is null', async () => {
    const { useAuthStore } = await import('@/stores/auth.store')
    useAuthStore.mockReturnValueOnce({ userData: null })
    setActivePinia(createPinia())
    const store = useTransactionStore()
    expect(store.coins).toBe(0)
  })

  // ── recalculateUserCoins ──────────────────────────────────────────────────

  it('recalculateUserCoins: subtracts the given amount from coins', () => {
    const store = useTransactionStore()
    store.recalculateUserCoins(200)
    expect(store.coins).toBe(800)
  })

  it('recalculateUserCoins: allows coins to go below 0', () => {
    const store = useTransactionStore()
    store.recalculateUserCoins(1500)
    expect(store.coins).toBe(-500)
  })

  it('recalculateUserCoins: subtracting 0 leaves coins unchanged', () => {
    const store = useTransactionStore()
    store.recalculateUserCoins(0)
    expect(store.coins).toBe(1000)
  })

  // ── addToUserInventory ────────────────────────────────────────────────────

  it('addToUserInventory: adds an item to the items array', () => {
    const store = useTransactionStore()
    const item = { id: 42, name: 'Skin roja' }
    store.addToUserInventory(item)
    expect(store.items).toHaveLength(1)
    expect(store.items[0]).toEqual(item)
  })

  it('addToUserInventory: accumulates multiple items', () => {
    const store = useTransactionStore()
    store.addToUserInventory({ id: 1, name: 'Item A' })
    store.addToUserInventory({ id: 2, name: 'Item B' })
    expect(store.items).toHaveLength(2)
  })
})
