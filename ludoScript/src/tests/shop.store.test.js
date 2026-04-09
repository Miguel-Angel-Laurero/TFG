import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useShopStore } from '@/stores/shop.store'

describe('shop.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  // ── Initial state ─────────────────────────────────────────────────────────

  it('initialises with empty searchQuery', () => {
    const store = useShopStore()
    expect(store.searchQuery).toBe('')
  })

  it('initialises with empty selectedCategories', () => {
    const store = useShopStore()
    expect(store.selectedCategories).toEqual([])
  })

  it('initialises acquisitionFilter as "todos"', () => {
    const store = useShopStore()
    expect(store.acquisitionFilter).toBe('todos')
  })

  // ── State mutations ───────────────────────────────────────────────────────

  it('updates searchQuery', () => {
    const store = useShopStore()
    store.searchQuery = 'skin'
    expect(store.searchQuery).toBe('skin')
  })

  it('adds categories to selectedCategories', () => {
    const store = useShopStore()
    store.selectedCategories = ['skins', 'banners']
    expect(store.selectedCategories).toEqual(['skins', 'banners'])
  })

  it('updates acquisitionFilter', () => {
    const store = useShopStore()
    store.acquisitionFilter = 'coins'
    expect(store.acquisitionFilter).toBe('coins')
  })
})
