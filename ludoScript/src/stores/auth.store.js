import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/api/auth.service'
import router from '@/router/router'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const userData = ref(null)
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

  async function fetchMe() {
    try {
      const { data } = await authService.me()
      user.value = data
      userData.value = data.userData
    } catch (e) {
      if (e.response?.status === 401) {
        logout()
      }
    }
  }

  function logout() {
    user.value  = null
    token.value = null
    localStorage.removeItem('token')
    router.push('/login-view/')
  }

  return { user,userData, token, isLoggedIn, error, loading, login, register, fetchMe, logout }
})