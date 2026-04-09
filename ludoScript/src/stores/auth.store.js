import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/api/auth.service'
import router from '@/router/router'

const SESSION_DATA_KEY = 'session_data'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userData = ref(
    (() => {
      try {
        const stored = localStorage.getItem(SESSION_DATA_KEY)
        return stored ? JSON.parse(stored) : null
      } catch {
        return null
      }
    })()
  )
  const token   = ref(localStorage.getItem('token'))
  const error   = ref(null)
  const loading = ref(false)

  const isLoggedIn = computed(() => !!token.value)

  async function login(credentials) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authService.login(credentials)
      token.value = data.token
      user.value  = data.user
      localStorage.setItem('token', data.token)
      router.push('/')
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al iniciar sesión'
    } finally {
      loading.value = false
    }
  }

  async function register(credentials) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await authService.register(credentials)
      token.value = data.token
      user.value  = data.user
      localStorage.setItem('token', data.token)
      router.push('/')
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al registrarse'
    } finally {
      loading.value = false
    }
  }

  const ready = ref(false)

  async function fetchMe() {
    try {
      const { data } = await authService.me()
      user.value = data
      userData.value = data.userData
      // Persist minimal session data to localStorage
      if (data.userData) {
        const sessionData = {
          coins:     data.userData.coins     ?? 0,
          streak:    data.userData.streak    ?? 0,
          accuracy:  data.userData.accuracy  ?? 0,
          timeSpent: data.userData.timeSpent ?? 0,
          tests:     data.userData.tests     ?? null,
        }
        localStorage.setItem(SESSION_DATA_KEY, JSON.stringify(sessionData))
      }
    } catch (e) {
      if (e.response?.status === 401) logout()
    } finally {
      ready.value = true  // ← siempre se marca como listo, falle o no
    }
  }

  function logout() {
    user.value  = null
    userData.value = null
    token.value = null
    localStorage.removeItem('token')
    localStorage.removeItem(SESSION_DATA_KEY)
    localStorage.removeItem('session_weekly')
    router.push('/login-view/')
  }

  return { user, userData, token, isLoggedIn, error, loading, login, register, fetchMe, logout, ready }
})