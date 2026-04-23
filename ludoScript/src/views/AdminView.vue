<template>
    <div class="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
        <AdminHeader />

        <main class="flex-1 p-6 max-w-6xl mx-auto w-full">
            <AdminUsersTable
                :users="adminStore.users"
                :pagination="adminStore.pagination"
                :loading="adminStore.loading"
                :error="adminStore.error"
                @search="handleSearch"
                @page-change="changePage"
                @edit="openEditModal"
                @delete="confirmDelete"
                @create="isCreateModalOpen = true"
                @clear-error="adminStore.clearError"
            />
        </main>

        <EditUserModal
            v-model="isEditModalOpen"
            :user="selectedUser"
            :loading="adminStore.loading"
            @save="saveUser"
        />

        <CreateUserModal
            v-model="isCreateModalOpen"
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
import AdminHeader from '@/components/admin/AdminHeader.vue'
import AdminUsersTable from '@/components/admin/AdminUsersTable.vue'
import EditUserModal from '@/components/admin/EditUserModal.vue'
import CreateUserModal from '@/components/admin/CreateUserModal.vue'

const adminStore = useAdminStore()
const toast      = useToast()
const confirm    = useConfirm()

const isEditModalOpen   = ref(false)
const isCreateModalOpen = ref(false)
const selectedUser      = ref(null)
const lastQuery         = ref('')

onMounted(() => adminStore.fetchUsers())

const handleSearch = (query) => {
    lastQuery.value = query
    adminStore.fetchUsers(1, 20, query)
}

const changePage = (newPage) => {
    adminStore.fetchUsers(newPage, 20, lastQuery.value)
}

const openEditModal = (user) => {
    selectedUser.value = { ...user }
    isEditModalOpen.value = true
}

const saveUser = async (formData) => {
    const result = await adminStore.updateUser(formData.id, formData)
    if (result) {
        toast?.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 })
        isEditModalOpen.value = false
    }
}

const createUser = async (formData) => {
    const result = await adminStore.createUser(formData)
    if (result) {
        toast?.add({ severity: 'success', summary: 'Creado', detail: 'Usuario creado correctamente', life: 3000 })
        isCreateModalOpen.value = false
        adminStore.fetchUsers(1, 20, lastQuery.value)
    }
}

const confirmDelete = (id) => {
    if (confirm) {
        confirm.require({
            message: '¿Estás seguro de que deseas eliminar este usuario de forma permanente?',
            header: 'Confirmar Eliminación',
            icon: 'pi pi-exclamation-triangle',
            acceptLabel: 'Eliminar',
            rejectLabel: 'Cancelar',
            acceptClass: 'p-button-danger',
            accept: async () => {
                const success = await adminStore.deleteUser(id)
                if (success) {
                    toast?.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario borrado correctamente', life: 3000 })
                }
            }
        })
    } else {
        if (window.confirm('¿Seguro que quieres eliminar este usuario?')) {
            adminStore.deleteUser(id)
        }
    }
}
</script>