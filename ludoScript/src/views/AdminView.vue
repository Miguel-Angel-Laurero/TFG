<template>
    <div class="min-h-screen bg-gray-900 text-white flex flex-col font-sans">
        <!-- Header -->
        <header class="bg-gray-800 p-4 shadow flex items-center justify-between">
            <h1 class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-blue-400">
                Panel de Administración
            </h1>
            <button @click="$router.push('/')" class="text-sm text-gray-400 hover:text-white transition">
                Volver a inicio
            </button>
        </header>

        <!-- Main Content -->
        <main class="flex-1 p-6 max-w-6xl mx-auto w-full">
            <div class="mb-6 flex justify-between items-center">
                <div>
                    <h2 class="text-2xl font-bold">Gestión de Usuarios</h2>
                    <p class="text-gray-400 text-sm">Administra roles, correos y acceso</p>
                </div>

                <!-- Search -->
                <div class="relative">
                    <input v-model="searchQuery" @keyup.enter="handleSearch" type="text"
                        placeholder="Buscar por usuario o email..."
                        class="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-sm w-64 focus:outline-none focus:border-purple-500" />
                    <button @click="handleSearch" class="absolute right-2 top-2 text-gray-400 hover:text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24"
                            stroke="currentColor">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                        </svg>
                    </button>
                </div>
            </div>

            <!-- Error alert -->
            <div v-if="adminStore.error" class="bg-red-500/20 text-red-300 p-3 rounded mb-4 flex justify-between">
                <span>{{ adminStore.error }}</span>
                <button @click="adminStore.clearError">✕</button>
            </div>

            <!-- Loading State -->
            <div v-if="adminStore.loading && adminStore.users.length === 0" class="text-center py-10 text-gray-400">
                Cargando usuarios...
            </div>

            <!-- Users Table -->
            <div v-else class="bg-gray-800 rounded-lg shadow overflow-hidden">
                <table class="w-full text-left border-collapse">
                    <thead>
                        <tr class="bg-gray-700 text-gray-300 text-sm uppercase">
                            <th class="p-4 border-b border-gray-600">ID</th>
                            <th class="p-4 border-b border-gray-600">Usuario</th>
                            <th class="p-4 border-b border-gray-600">Email</th>
                            <th class="p-4 border-b border-gray-600">Rol</th>
                            <th class="p-4 border-b border-gray-600">Fech. Registro</th>
                            <th class="p-4 border-b border-gray-600 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="user in adminStore.users" :key="user.id"
                            class="border-b border-gray-700/50 hover:bg-gray-700/30 transition">
                            <td class="p-4 text-gray-400">#{{ user.id }}</td>
                            <td class="p-4 font-medium">{{ user.username }}</td>
                            <td class="p-4 text-gray-300">{{ user.email }}</td>
                            <td class="p-4">
                                <span class="px-2 py-1 text-xs rounded-full"
                                    :class="user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'">
                                    {{ user.role }}
                                </span>
                            </td>
                            <td class="p-4 text-gray-400 text-sm">
                                {{ new Date(user.createdAt).toLocaleDateString() }}
                            </td>
                            <td class="p-4 text-right space-x-2">
                                <button @click="openEditModal(user)"
                                    class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition"
                                    title="Editar">
                                    ✏️
                                </button>
                                <button @click="confirmDelete(user.id)"
                                    class="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition mx-1"
                                    disabled title="Eliminar (No disponible en demo)">
                                    🗑️
                                </button>
                            </td>
                        </tr>
                        <tr v-if="adminStore.users.length === 0">
                            <td colspan="6" class="p-6 text-center text-gray-500">
                                No se encontraron usuarios.
                            </td>
                        </tr>
                    </tbody>
                </table>

                <!-- Pagination footer -->
                <div class="p-4 border-t border-gray-700 flex justify-between items-center text-sm text-gray-400">
                    <div>
                        Mostrando pág. {{ adminStore.pagination.page }} de {{ adminStore.pagination.totalPages }}
                        (Total: {{ adminStore.pagination.total }})
                    </div>
                    <div class="flex space-x-2">
                        <button @click="changePage(adminStore.pagination.page - 1)"
                            :disabled="adminStore.pagination.page <= 1"
                            class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            Anterior
                        </button>
                        <button @click="changePage(adminStore.pagination.page + 1)"
                            :disabled="adminStore.pagination.page >= adminStore.pagination.totalPages"
                            class="px-3 py-1 bg-gray-700 rounded hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed">
                            Siguiente
                        </button>
                    </div>
                </div>
            </div>
        </main>

        <!-- Edit User Modal -->
        <div v-if="isEditModalOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-700">
                <h3 class="text-xl font-bold mb-4">Editar Usuario</h3>
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Nombre de usuario</label>
                        <input v-model="editForm.username" type="text"
                            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Email</label>
                        <input v-model="editForm.email" type="email"
                            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500" />
                    </div>
                    <div>
                        <label class="block text-sm text-gray-400 mb-1">Rol</label>
                        <select v-model="editForm.role"
                            class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500">
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>
                <div class="mt-6 flex justify-end space-x-3">
                    <button @click="isEditModalOpen = false"
                        class="px-4 py-2 text-gray-400 hover:text-white transition">
                        Cancelar
                    </button>
                    <button @click="saveUser"
                        class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded font-medium shadow transition"
                        :disabled="adminStore.loading">
                        Guardar
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAdminStore } from '@/stores/admin.store';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from "primevue/useconfirm";

const adminStore = useAdminStore();
const toast = useToast();
const confirm = useConfirm();

const searchQuery = ref('');
const isEditModalOpen = ref(false);
const editForm = ref({
    id: null,
    username: '',
    email: '',
    role: ''
});

onMounted(() => {
    adminStore.fetchUsers();
});

const handleSearch = () => {
    adminStore.fetchUsers(1, 20, searchQuery.value.trim());
};

const changePage = (newPage) => {
    adminStore.fetchUsers(newPage, 20, searchQuery.value.trim());
};

const openEditModal = (user) => {
    editForm.value = { ...user };
    isEditModalOpen.value = true;
};

const saveUser = async () => {
    const result = await adminStore.updateUser(editForm.value.id, editForm.value);
    if (result) {
        if (toast) {
            toast.add({ severity: 'success', summary: 'Éxito', detail: 'Usuario actualizado', life: 3000 });
        }
        isEditModalOpen.value = false;
    }
};

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
                const success = await adminStore.deleteUser(id);
                if (success && toast) {
                    toast.add({ severity: 'success', summary: 'Eliminado', detail: 'Usuario borrado correctamente', life: 3000 });
                }
            }
        });
    } else {
        // Fallback if PrimeVue confirm service not available
        if (window.confirm("¿Seguro que quieres eliminar este usuario?")) {
            adminStore.deleteUser(id);
        }
    }
};
</script>