<template>
    <div class="flex flex-col gap-6">
        <!-- Título -->
        <div class="bg-slate-800/90 backdrop-blur-sm rounded-xl p-5 shadow-xl">
            <h2 class="text-white font-bold text-2xl mb-1">Editar Perfil</h2>
            <p class="text-gray-400 text-sm">Actualiza tu nombre de usuario y tu avatar.</p>
        </div>

        <!-- Nombre de usuario -->
        <div class="bg-slate-800/90 backdrop-blur-sm rounded-xl p-5 shadow-xl flex flex-col gap-3">
            <label class="text-gray-300 font-semibold text-sm">Nombre de usuario</label>
            <input v-model="newUsername" type="text" maxlength="40"
                class="bg-slate-700/80 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Tu nombre de usuario" />
        </div>

        <!-- Selector de avatar (iconos predefinidos) -->
        <div class="bg-slate-800/90 backdrop-blur-sm rounded-xl p-5 shadow-xl flex flex-col gap-3">
            <label class="text-gray-300 font-semibold text-sm">Avatar</label>
            <div v-if="loadingIcons" class="text-white/40 text-sm py-4 text-center">Cargando iconos…</div>
            <div v-else class="grid grid-cols-4 sm:grid-cols-6 gap-3">
                <button v-for="icon in icons" :key="icon.id" @click="selectedAvatar = icon.img" :class="[
                    'rounded-full p-1 border-2 transition-all duration-200 focus:outline-none',
                    selectedAvatar === icon.img
                        ? 'border-blue-400 ring-2 ring-blue-400/50'
                        : 'border-transparent hover:border-slate-500'
                ]" :title="icon.name">
                    <img :src="icon.img" :alt="icon.name" class="w-12 h-12 rounded-full object-cover" />
                </button>
            </div>
        </div>

        <!-- Equipamiento del avatar -->
        <div class="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden" style="height: 420px;">
            <div class="px-5 pt-5 pb-3">
                <label class="text-gray-300 font-semibold text-sm">Equipamiento del avatar</label>
            </div>
            <div class="h-[360px]">
                <AvatarProfile />
            </div>
        </div>

        <!-- Acciones -->
        <div class="flex justify-end gap-3 pb-4">
            <button @click="router.back()"
                class="px-5 py-2 rounded-lg text-gray-300 hover:text-white border border-slate-600 hover:border-slate-400 transition-colors">
                Cancelar
            </button>
            <button @click="save" :disabled="saving"
                class="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors">
                {{ saving ? 'Guardando…' : 'Guardar cambios' }}
            </button>
        </div>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth.store'
import { userService } from '@/api/user.service'
import AvatarProfile from './AvatarProfile.vue'

const router = useRouter()
const auth = useAuthStore()

const newUsername = ref(auth.user?.username ?? '')
const selectedAvatar = ref(auth.user?.avatar ?? '')
const icons = ref([])
const loadingIcons = ref(true)
const saving = ref(false)

onMounted(async () => {
    try {
        const res = await fetch('/itemData.json')
        const all = await res.json()
        icons.value = all.filter(item => item.category === 'icons')
    } catch (_) {
        // si falla, no se muestran iconos predefinidos
    } finally {
        loadingIcons.value = false
    }
})

async function save() {
    if (!newUsername.value.trim()) return
    saving.value = true
    try {
        const updates = {}
        if (newUsername.value.trim() !== auth.user?.username) {
            updates.username = newUsername.value.trim()
        }
        if (selectedAvatar.value && selectedAvatar.value !== auth.user?.avatar) {
            updates.avatar = selectedAvatar.value
        }
        if (Object.keys(updates).length > 0) {
            await userService.update(auth.user.id, updates)
            await auth.fetchMe()
        }
        router.back()
    } catch (e) {
        console.error('Error al guardar perfil:', e)
    } finally {
        saving.value = false
    }
}
</script>
