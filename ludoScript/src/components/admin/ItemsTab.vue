<template>
    <div>
        <AdminItemsTable
            :items="itemStore.items"
            :pagination="itemStore.pagination"
            :loading="itemStore.loading"
            :error="itemStore.error"
            @search="handleSearch"
            @page-change="changePage"
            @edit="openEdit"
            @delete="confirmDelete"
            @create="isCreateOpen = true"
            @clear-error="itemStore.clearError"
        />

        <EditItemModal
            v-model="isEditOpen"
            :item="selectedItem"
            :loading="itemStore.loading"
            :categories="itemStore.categories"
            @save="saveItem"
        />
        <CreateItemModal
            v-model="isCreateOpen"
            :loading="itemStore.loading"
            :categories="itemStore.categories"
            @save="createItem"
        />
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminItemStore } from '@/stores/adminItem.store'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import AdminItemsTable from './AdminItemsTable.vue'
import EditItemModal from './EditItemModal.vue'
import CreateItemModal from './CreateItemModal.vue'

const itemStore = useAdminItemStore()
const toast     = useToast()
const confirm   = useConfirm()

const isEditOpen   = ref(false)
const isCreateOpen = ref(false)
const selectedItem = ref(null)
const lastQuery    = ref('')

onMounted(() => {
    itemStore.fetchItems()
    itemStore.fetchCategories()
})

const handleSearch = (query) => {
    lastQuery.value = query
    itemStore.fetchItems(1, 20, query)
}
const changePage = (page) => itemStore.fetchItems(page, 20, lastQuery.value)

const openEdit = (item) => {
    selectedItem.value = { ...item }
    isEditOpen.value = true
}
const saveItem = async ({ id, formData }) => {
    const ok = await itemStore.updateItem(id, formData)
    if (ok) {
        toast?.add({ severity: 'success', summary: 'Éxito', detail: 'Item actualizado', life: 3000 })
        isEditOpen.value = false
    }
}
const createItem = async (formData) => {
    const ok = await itemStore.createItem(formData)
    if (ok) {
        toast?.add({ severity: 'success', summary: 'Creado', detail: 'Item creado', life: 3000 })
        isCreateOpen.value = false
        itemStore.fetchItems(1, 20, lastQuery.value)
    }
}
const confirmDelete = (id) => {
    confirm.require({
        message: '¿Eliminar este item de forma permanente?',
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        acceptClass: 'p-button-danger',
        accept: async () => {
            const ok = await itemStore.deleteItem(id)
            if (ok) toast?.add({ severity: 'success', summary: 'Eliminado', detail: 'Item borrado', life: 3000 })
        }
    })
}
</script>
