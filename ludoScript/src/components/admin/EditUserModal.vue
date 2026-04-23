<template>
    <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-700">
            <h3 class="text-xl font-bold mb-4">Editar Usuario</h3>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Nombre de usuario</label>
                    <input
                        v-model="form.username"
                        type="text"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                        v-model="form.email"
                        type="email"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    />
                </div>
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Rol</label>
                    <select
                        v-model="form.role"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                    </select>
                </div>
            </div>

            <div class="mt-6 flex justify-end space-x-3">
                <button
                    @click="$emit('update:modelValue', false)"
                    class="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                    Cancelar
                </button>
                <button
                    @click="$emit('save', { ...form })"
                    :disabled="loading"
                    class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded font-medium shadow transition disabled:opacity-50"
                >
                    Guardar
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive, watch } from 'vue'

const props = defineProps({
    modelValue: { type: Boolean, required: true },  // v-model para open/close
    user:       { type: Object,  default: null },
    loading:    { type: Boolean, default: false },
})

defineEmits(['update:modelValue', 'save'])

const form = reactive({ id: null, username: '', email: '', role: '' })

// Sincroniza el form cuando cambia el usuario a editar
watch(() => props.user, (user) => {
    if (user) Object.assign(form, user)
}, { immediate: true })
</script>
