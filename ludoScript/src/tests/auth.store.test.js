import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'

// ---------------------------------------------------------------------------
// Mocks
// ---------------------------------------------------------------------------
vi.mock('@/api/auth.service', () => ({
  authService: {
    login:    vi.fn(),
    register: vi.fn(),
    me:       vi.fn(),
  },
}))

import { authService } from '@/api/auth.service'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
const SESSION_DATA_KEY = 'session_data'

const mockUserData = {
  coins:     500,
  streak:    3,
  accuracy:  0.85,
  timeSpent: 120,
  tests:     10,
}

const mockUser = { id: 1, username: 'testuser', userData: mockUserData }

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe('auth.store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  afterEach(() => {
    localStorage.clear()
  })

  // ── Initialisation ──────────────────────────────────────────────────────

  it('initialises token from localStorage', () => {
    localStorage.setItem('token', 'saved-token')
    setActivePinia(createPinia())  // recreate pinia after setting localStorage
    const store = useAuthStore()
    expect(store.token).toBe('saved-token')
  })

  it('initialises userData from localStorage session_data', () => {
    localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(mockUserData))
    setActivePinia(createPinia())
    const store = useAuthStore()
    expect(store.userData).toEqual(mockUserData)
  })

  it('initialises userData as null when localStorage is empty', () => {
    const store = useAuthStore()
    expect(store.userData).toBeNull()
  })

  it('initialises userData as null when localStorage has malformed JSON', () => {
    localStorage.setItem(SESSION_DATA_KEY, 'not-valid-json{{')
    setActivePinia(createPinia())
    const store = useAuthStore()
    expect(store.userData).toBeNull()
  })

  it('isLoggedIn is false when no token', () => {
    const store = useAuthStore()
    expect(store.isLoggedIn).toBe(false)
  })

  it('isLoggedIn is true when token exists', () => {
    localStorage.setItem('token', 'some-token')
    setActivePinia(createPinia())
    const store = useAuthStore()
    expect(store.isLoggedIn).toBe(true)
  })

  // ── login ────────────────────────────────────────────────────────────────

  it('login: sets token and user on success', async () => {
    authService.login.mockResolvedValueOnce({
      data: { token: 'new-token', user: mockUser },
    })
    const store = useAuthStore()
    await store.login({ username: 'testuser', password: 'pass' })

    expect(store.token).toBe('new-token')
    expect(store.user).toEqual(mockUser)
    expect(localStorage.getItem('token')).toBe('new-token')
    expect(store.loading).toBe(false)
    expect(store.error).toBeNull()
  })

  it('login: sets error message on failure', async () => {
    authService.login.mockRejectedValueOnce({
      response: { data: { message: 'Credenciales incorrectas' } },
    })
    const store = useAuthStore()
    await store.login({ username: 'bad', password: 'bad' })

    expect(store.error).toBe('Credenciales incorrectas')
    expect(store.token).toBeNull()
    expect(store.loading).toBe(false)
  })

  it('login: uses fallback error message when no response body', async () => {
    authService.login.mockRejectedValueOnce(new Error('Network error'))
    const store = useAuthStore()
    await store.login({ username: 'bad', password: 'bad' })

    expect(store.error).toBe('Error al iniciar sesión')
  })

  // ── register ─────────────────────────────────────────────────────────────

  it('register: sets token and user on success', async () => {
    authService.register.mockResolvedValueOnce({
      data: { token: 'reg-token', user: mockUser },
    })
    const store = useAuthStore()
    await store.register({ username: 'newuser', password: 'pass' })

    expect(store.token).toBe('reg-token')
    expect(store.user).toEqual(mockUser)
    expect(localStorage.getItem('token')).toBe('reg-token')
  })

  it('register: sets error message on failure', async () => {
    authService.register.mockRejectedValueOnce({
      response: { data: { message: 'El usuario ya existe' } },
    })
    const store = useAuthStore()
    await store.register({ username: 'dup', password: 'pass' })

    expect(store.error).toBe('El usuario ya existe')
  })

  // ── fetchMe ──────────────────────────────────────────────────────────────

  it('fetchMe: updates user, userData and persists to localStorage', async () => {
    authService.me.mockResolvedValueOnce({ data: mockUser })
    const store = useAuthStore()
    await store.fetchMe()

    expect(store.user).toEqual(mockUser)
    expect(store.userData).toEqual(mockUserData)
    expect(store.ready).toBe(true)

    const stored = JSON.parse(localStorage.getItem(SESSION_DATA_KEY))
    expect(stored.coins).toBe(500)
    expect(stored.streak).toBe(3)
    expect(stored.accuracy).toBe(0.85)
    expect(stored.timeSpent).toBe(120)
    expect(stored.tests).toBe(10)
  })

  it('fetchMe: uses ?? 0 fallback for missing numeric fields', async () => {
    authService.me.mockResolvedValueOnce({
      data: { id: 1, username: 'u', userData: { coins: null, streak: undefined } },
    })
    const store = useAuthStore()
    await store.fetchMe()

    const stored = JSON.parse(localStorage.getItem(SESSION_DATA_KEY))
    expect(stored.coins).toBe(0)
    expect(stored.streak).toBe(0)
  })

  it('fetchMe: marks ready even on network error', async () => {
    authService.me.mockRejectedValueOnce(new Error('Network error'))
    const store = useAuthStore()
    await store.fetchMe()

    expect(store.ready).toBe(true)
  })

  it('fetchMe: calls logout on 401', async () => {
    authService.me.mockRejectedValueOnce({ response: { status: 401 } })
    const store = useAuthStore()
    store.token = 'expired-token'
    await store.fetchMe()

    expect(store.token).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('fetchMe: does not persist session_data when userData is absent', async () => {
    authService.me.mockResolvedValueOnce({ data: { id: 1, username: 'u' } })
    const store = useAuthStore()
    await store.fetchMe()

    expect(localStorage.getItem(SESSION_DATA_KEY)).toBeNull()
  })

  // ── logout ───────────────────────────────────────────────────────────────

  it('logout: clears in-memory state', () => {
    localStorage.setItem('token', 'tok')
    setActivePinia(createPinia())
    const store = useAuthStore()
    store.user     = mockUser
    store.userData = mockUserData
    store.token    = 'tok'

    store.logout()

    expect(store.user).toBeNull()
    expect(store.userData).toBeNull()
    expect(store.token).toBeNull()
  })

  it('logout: removes token, session_data and session_weekly from localStorage', () => {
    localStorage.setItem('token', 'tok')
    localStorage.setItem(SESSION_DATA_KEY, '{}')
    localStorage.setItem('session_weekly', '{}')
    setActivePinia(createPinia())
    const store = useAuthStore()
    store.logout()

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem(SESSION_DATA_KEY)).toBeNull()
    expect(localStorage.getItem('session_weekly')).toBeNull()
  })
})
