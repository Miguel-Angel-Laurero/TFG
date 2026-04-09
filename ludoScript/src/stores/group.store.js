import { defineStore } from 'pinia'
import { ref } from 'vue'
import { groupService } from '@/api/group.service'

export const useGroupStore = defineStore('group', () => {
  const groups = ref([])
  const loading = ref(false)
  const error = ref(null)

  async function fetchMyGroups() {
    loading.value = true
    error.value = null
    try {
      const { data } = await groupService.getMyGroups()
      groups.value = data
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al cargar grupos'
    } finally {
      loading.value = false
    }
  }

  async function createGroup(payload) {
    loading.value = true
    error.value = null
    try {
      const { data } = await groupService.createGroup(payload)
      groups.value.push(data)
      return data
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al crear grupo'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function joinGroup(inviteCode) {
    loading.value = true
    error.value = null
    try {
      const { data } = await groupService.joinGroup(inviteCode)
      groups.value.push(data)
      return data
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al unirse al grupo'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function leaveGroup(id) {
    loading.value = true
    error.value = null
    try {
      await groupService.leaveGroup(id)
      groups.value = groups.value.filter((g) => g.id !== id)
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al abandonar grupo'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function deleteGroup(id) {
    loading.value = true
    error.value = null
    try {
      await groupService.deleteGroup(id)
      groups.value = groups.value.filter((g) => g.id !== id)
    } catch (e) {
      error.value = e.response?.data?.message ?? 'Error al eliminar grupo'
      throw e
    } finally {
      loading.value = false
    }
  }

  return { groups, loading, error, fetchMyGroups, createGroup, joinGroup, leaveGroup, deleteGroup }
})
