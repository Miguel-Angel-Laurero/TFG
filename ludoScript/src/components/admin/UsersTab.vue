<template>
  <div>
    <AdminUsersTable
      :users="adminStore.users"
      :pagination="adminStore.pagination"
      :loading="adminStore.loading"
      :error="adminStore.error"
      @search="handleSearch"
      @page-change="changePage"
      @edit="openEdit"
      @delete="confirmDelete"
      @create="isCreateOpen = true"
      @clear-error="adminStore.clearError"
    />

    <EditUserModal
      v-model="isEditOpen"
      :user="selectedUser"
      :loading="adminStore.loading"
      @save="saveUser"
    />
    <CreateUserModal
      v-model="isCreateOpen"
      :loading="adminStore.loading"
      @save="createUser"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useAdminStore } from '@/stores/admin.store'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import AdminUsersTable from './AdminUsersTable.vue'
import EditUserModal from './EditUserModal.vue'
import CreateUserModal from './CreateUserModal.vue'

const adminStore = useAdminStore()
const toast      = useToast()
const confirm    = useConfirm()

const isEditOpen   = ref(false)
const isCreateOpen = ref(false)
const selectedUser = ref(null)
const lastQuery    = ref('')

onMounted(() => adminStore.fetchUsers())

const handleSearch = (query) => {
    lastQuery.value = query
    adminStore.fetchUsers(1, 20, query)
}
const changePage = (page) => adminStore.fetchUsers(page, 20, lastQuery.value)

const openEdit = (user) => {
    selectedUser.value = { ...user }
    isEditOpen.value = true
}
const saveUser = async (formData) => {
    const ok = await adminStore.updateUser(formData.id, formData)
    if (ok) {
        toast?.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 })
        isEditOpen.value = false
    }
}
const createUser = async (formData) => {
    const ok = await adminStore.createUser(formData)
    if (ok) {
        toast?.add({ severity: 'success', summary: 'Creado', detail: 'Usuario creado', life: 3000 })
        isCreateOpen.value = false
        adminStore.fetchUsers(1, 20, lastQuery.value)
    }
}
const confirmDelete = (id) => {
    confirm.require({
        message: '¿Eliminar este usuario de forma permanente?',
        header: 'Confirmar eliminación',
        icon: 'pi pi-exclamation-triangle',
        acceptLabel: 'Eliminar',
        rejectLabel: 'Cancelar',
        acceptClass: 'p-button-danger',
        accept: async () => {
            const ok = await adminStore.deleteUser(id)
            if (ok) toast?.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario borrado', life: 3000 })
        }
    })
}
</script>
