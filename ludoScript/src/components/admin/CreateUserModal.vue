<template>
    <div
        v-if="modelValue"
        class="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
        <div class="bg-gray-800 rounded-lg p-6 w-full max-w-md shadow-xl border border-gray-700">
            <h3 class="text-xl font-bold mb-4">Nuevo Usuario</h3>

            <div class="space-y-4">
                <div>
                    <label class="block text-sm text-gray-400 mb-1">Nombre de usuario</label>
                    <input
                        v-model="form.username"
                        type="text"
                        placeholder="ej. john_doe"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        :class="{ 'border-red-500': errors.username }"
                    />
                    <p v-if="errors.username" class="text-red-400 text-xs mt-1">{{ errors.username }}</p>
                </div>

                <div>
                    <label class="block text-sm text-gray-400 mb-1">Email</label>
                    <input
                        v-model="form.email"
                        type="email"
                        placeholder="ej. john@example.com"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        :class="{ 'border-red-500': errors.email }"
                    />
                    <p v-if="errors.email" class="text-red-400 text-xs mt-1">{{ errors.email }}</p>
                </div>

                <div>
                    <label class="block text-sm text-gray-400 mb-1">Contraseña</label>
                    <input
                        v-model="form.password"
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        class="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                        :class="{ 'border-red-500': errors.password }"
                    />
                    <p v-if="errors.password" class="text-red-400 text-xs mt-1">{{ errors.password }}</p>
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
                    @click="handleClose"
                    class="px-4 py-2 text-gray-400 hover:text-white transition"
                >
                    Cancelar
                </button>
                <button
                    @click="handleSave"
                    :disabled="loading"
                    class="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded font-medium shadow transition disabled:opacity-50"
                >
                    {{ loading ? 'Creando...' : 'Crear usuario' }}
                </button>
            </div>
        </div>
    </div>
</template>

<script setup>
import { reactive } from 'vue'

defineProps({
    modelValue: { type: Boolean, required: true },
    loading:    { type: Boolean, default: false },
})

const emit = defineEmits(['update:modelValue', 'save'])

const EMPTY_FORM = { username: '', email: '', password: '', role: 'user' }

const form   = reactive({ ...EMPTY_FORM })
const errors = reactive({ username: '', email: '', password: '' })

const validate = () => {
    errors.username = form.username.trim()  ? '' : 'El nombre de usuario es obligatorio'
    errors.email    = /\S+@\S+\.\S+/.test(form.email) ? '' : 'Email no válido'
    errors.password = form.password.length >= 8 ? '' : 'La contraseña debe tener al menos 8 caracteres'
    return !errors.username && !errors.email && !errors.password
}

const handleSave = () => {
    if (!validate()) return
    emit('save', { ...form })
}

const handleClose = () => {
    Object.assign(form, EMPTY_FORM)
    Object.assign(errors, { username: '', email: '', password: '' })
    emit('update:modelValue', false)
}
</script>
