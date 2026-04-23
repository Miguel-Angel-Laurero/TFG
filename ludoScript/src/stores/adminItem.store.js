import { defineStore } from 'pinia'
import { ref } from 'vue'
import adminItemService from '@/api/adminItem.service'

export const useAdminItemStore = defineStore('adminItem', () => {
    const items      = ref([])
    const categories = ref([])
    const loading    = ref(false)
    const error      = ref(null)
    const pagination = ref({ page: 1, totalPages: 1, total: 0 })

    const clearError = () => { error.value = null }

    const fetchItems = async (page = 1, limit = 20, search = '') => {
        loading.value = true
        error.value   = null
        try {
            const { data } = await adminItemService.getItems(page, limit, search)
            items.value      = data.items
            pagination.value = { page: data.page, totalPages: data.totalPages, total: data.total }
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al obtener items'
            return null
        } finally {
            loading.value = false
        }
    }

    const fetchCategories = async () => {
        try {
            const { data } = await adminItemService.getCategories()
            categories.value = data
        } catch (err) {
            console.error('Error al cargar categorías:', err)
        }
    }

    const createItem = async (itemData) => {
        loading.value = true
        error.value   = null
        try {
            const { data } = await adminItemService.createItem(itemData)
            items.value.unshift(data.item)
            pagination.value.total += 1
            return data
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al crear item'
            return null
        } finally {
            loading.value = false
        }
    }

    const updateItem = async (id, itemData) => {
        loading.value = true
        error.value   = null
        try {
            const { data } = await adminItemService.updateItem(id, itemData)
            const index = items.value.findIndex(i => i.id === id)
            if (index !== -1) Object.assign(items.value[index], data.item)
            return data
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al actualizar item'
            return null
        } finally {
            loading.value = false
        }
    }

    const deleteItem = async (id) => {
        loading.value = true
        error.value   = null
        try {
            await adminItemService.deleteItem(id)
            items.value = items.value.filter(i => i.id !== id)
            pagination.value.total -= 1
            return true
        } catch (err) {
            error.value = err.response?.data?.message || 'Error al eliminar item'
            return null
        } finally {
            loading.value = false
        }
    }

    return { items, categories, loading, error, pagination, clearError, fetchItems, fetchCategories, createItem, updateItem, deleteItem }
})
