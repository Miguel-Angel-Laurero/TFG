import { defineStore } from 'pinia'
import { ref } from 'vue'
import { userService } from '@/api/user.service'

export const useUserStore = defineStore('user', () => {
  const users   = ref([])
  const current = ref(null)
  const error   = ref(null)
  const loading = ref(false)

  async function fetchAll() {
    loading.value = true
    error.value   = null
    try {
      const { data } = await userService.getAll()
      users.value = data
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al cargar usuarios'
    } finally {
      loading.value = false
    }
  }

  async function fetchById(id) {
    loading.value = true
    error.value   = null
    try {
      const { data } = await userService.getById(id)
      current.value = data
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al cargar el usuario'
    } finally {
      loading.value = false
    }
  }

  async function update(id, data) {
    loading.value = true
    error.value   = null
    try {
      const { data: updated } = await userService.update(id, data)
      current.value = updated
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al actualizar el usuario'
    } finally {
      loading.value = false
    }
  }

  async function remove(id) {
    loading.value = true
    error.value   = null
    try {
      await userService.remove(id)
      users.value = users.value.filter((u) => u.id !== id)
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al eliminar el usuario'
    } finally {
      loading.value = false
    }
  }

  return { users, current, error, loading, fetchAll, fetchById, update, remove }
})
