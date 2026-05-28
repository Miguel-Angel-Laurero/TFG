<template>
  <div>
    <!-- Toolbar -->
    <div class="mb-6 flex justify-between items-center">
      <div>
        <h2 class="text-2xl font-bold">
          Gestión de Usuarios
        </h2>
        <p class="text-gray-400 text-sm">
          Administra roles, correos y acceso
        </p>
      </div>

      <div class="flex items-center gap-3">
        <!-- Search -->
        <div class="relative">
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Buscar por usuario o email..."
            class="bg-gray-800 border border-gray-700 rounded px-4 py-2 text-sm w-64 focus:outline-none focus:border-purple-500"
            @keyup.enter="$emit('search', searchQuery.trim())"
          >
          <button
            class="absolute right-2 top-2 text-gray-400 hover:text-white"
            @click="$emit('search', searchQuery.trim())"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </button>
        </div>

        <!-- New user -->
        <button
          class="flex items-center gap-2 px-4 py-2 cursor-pointer bg-indigo-900 hover:bg-indigo-700 text-white text-sm rounded font-medium shadow transition"
          @click="$emit('create')"
        >
          <span class="text-lg leading-none">＋</span> Nuevo usuario
        </button>
      </div>
    </div>

    <!-- Error alert -->
    <div
      v-if="error"
      class="bg-red-500/20 text-red-300 p-3 rounded mb-4 flex justify-between"
    >
      <span>{{ error }}</span>
      <button @click="$emit('clear-error')">
        ✕
      </button>
    </div>

    <!-- Loading State -->
    <div
      v-if="loading && users.length === 0"
      class="text-center py-10 text-gray-400"
    >
      Cargando usuarios...
    </div>

    <!-- Users Table -->
    <div
      v-else
      class="bg-indigo-950/40 rounded-lg shadow overflow-hidden"
    >
      <div class="overflow-y-auto max-h-[40vh]">
        <table class="w-full text-left border-collapse">
          <thead class="sticky top-0 z-10">
            <tr class="bg-indigo-700/40 text-gray-300 text-sm uppercase">
              <th class="p-4 border-b border-gray-600">
                ID
              </th>
              <th class="p-4 border-b border-gray-600">
                Usuario
              </th>
              <th class="p-4 border-b border-gray-600">
                Email
              </th>
              <th class="p-4 border-b border-gray-600">
                Rol
              </th>
              <th class="p-4 border-b border-gray-600">
                Fech. Registro
              </th>
              <th class="p-4 border-b border-gray-600 text-right">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="user in users"
              :key="user.id"
              class="border-b border-gray-700/50 hover:bg-gray-700/30 transition"
            >
              <td class="p-4 text-gray-400">
                #{{ user.id }}
              </td>
              <td class="p-4 font-medium">
                {{ user.username }}
              </td>
              <td class="p-4 text-gray-300">
                {{ user.email }}
              </td>
              <td class="p-4">
                <span
                  class="px-2 py-1 text-xs rounded-full"
                  :class="user.role === 'admin' ? 'bg-purple-500/20 text-purple-300' : 'bg-blue-500/20 text-blue-300'"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="p-4 text-gray-400 text-sm">
                {{ new Date(user.createdAt).toLocaleDateString() }}
              </td>
              <td class="p-4 text-right space-x-2">
                <button
                  class="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-400/10 rounded transition cursor-pointer"
                  title="Editar"
                  @click="$emit('edit', user)"
                >
                  ✏️
                </button>
                <button
                  class="p-2 text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded transition mx-1 cursor-pointer"
                  title="Eliminar (No disponible en demo)"
                  @click="$emit('delete', user.id)"
                >
                  🗑️
                </button>
              </td>
            </tr>
            <tr v-if="users.length === 0">
              <td
                colspan="6"
                class="p-6 text-center text-gray-500"
              >
                No se encontraron usuarios.
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <!-- Pagination -->
      <div class="p-4 border-t border-gray-700 flex justify-between items-center text-sm text-gray-400">
        <div>
          Mostrando pág. {{ pagination.page }} de {{ pagination.totalPages }}
          (Total: {{ pagination.total }})
        </div>
        <div class="flex space-x-2">
          <button
            :disabled="pagination.page <= 1"
            class="px-3 py-1 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="$emit('page-change', pagination.page - 1)"
          >
            Anterior
          </button>
          <button
            :disabled="pagination.page >= pagination.totalPages"
            class="px-3 py-1 bg-gray-700 rounded cursor-pointer hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
            @click="$emit('page-change', pagination.page + 1)"
          >
            Siguiente
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

defineProps({
    users:      { type: Array,   required: true },
    pagination: { type: Object,  required: true },
    loading:    { type: Boolean, default: false },
    error:      { type: String,  default: null },
})

defineEmits(['search', 'page-change', 'edit', 'delete', 'clear-error', 'create'])

const searchQuery = ref('')
</script>