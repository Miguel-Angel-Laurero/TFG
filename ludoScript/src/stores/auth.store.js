import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/api/auth.service'
import router from '@/router/router'

export const useAuthStore = defineStore('auth', () => {
  const user     = ref(null)
  const userData = ref(null)
  const token    = ref(localStorage.getItem('token'))
  const error    = ref(null)
  const loading  = ref(false)

  const hasToken   = computed(() => !!token.value)
  const isLoggedIn = computed(() => !!token.value && !!user.value)

  async function login(credentials) {
    loading.value = true
    error.value   = null
    ready.value   = false
    try {
      const { data } = await authService.login(credentials)
      token.value = data.token
      user.value  = data.user
      localStorage.setItem('token', data.token)

      // Tras un login en una app ya montada, App.vue no vuelve a ejecutarse.
      // Forzamos aquí la carga completa del usuario para tener userData lista
      // antes de navegar a vistas que dependen de progreso, monedas, etc.
      await fetchMe()

      // Cargamos el estado de la recompensa diaria ANTES de navegar
      // para que HomeView ya tenga `claimed` correcto al montarse
      const { useRewardsStore } = await import('@/stores/rewards.store')
      await useRewardsStore().fetchRewards()

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
    ready.value   = false
    try {
      const { data } = await authService.register(credentials)
      token.value = data.token
      user.value  = data.user
      localStorage.setItem('token', data.token)

      await fetchMe()

      const { useRewardsStore } = await import('@/stores/rewards.store')
      await useRewardsStore().fetchRewards()

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
      user.value     = data
      userData.value = data.userData
    } catch (e) {
      if (e.response?.status === 401) logout()
    } finally {
      ready.value = true
    }
  }

  function logout() {
    user.value  = null
    userData.value = null
    token.value = null
    ready.value = true
    localStorage.removeItem('token')
    router.push('/login-view/')
  }

  return { user, userData, token, hasToken, isLoggedIn, error, loading, ready, login, register, fetchMe, logout }
})
