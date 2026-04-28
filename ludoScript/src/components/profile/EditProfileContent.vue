<template>
    <div class="min-h-[80vh] px-2 md:px-4 lg:px-6">

        <!-- Header -->
        <div class="flex items-center gap-4 mb-8">
            <div>
                <h1 class="text-3xl font-bold text-white">Editar Perfil</h1>
                <p class="text-gray-400 text-sm mt-0.5">Actualiza tu nombre de usuario, tu icono y tu banner.</p>
            </div>
        </div>

        <!-- Layout de dos columnas -->
        <div class="flex flex-col lg:flex-row gap-6 items-start">

            <!-- Columna izquierda: avatar/banner + stats -->
            <div class=" lg:w-72 shrink-0 flex flex-col gap-4">
                <div class="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 shadow-xl flex flex-col gap-3">
                    <label class="text-gray-300 font-semibold text-sm">Imagen de perfil</label>
                    <p class="text-xs text-gray-400">
                        Se muestran tu icono y banner actuales. Usa los botones para abrir el selector.
                    </p>
                    <EditProfile
                        :avatar="selectedAvatar"
                        :banner="selectedBanner"
                        @select-avatar="selectedAvatar = $event"
                        @select-banner="selectedBanner = $event"
                    />
                </div>
            </div>

            <!-- Columna derecha: formularios -->
            <div class="flex-1 flex flex-col gap-4">

                <!-- Nombre de usuario -->
                <div class="bg-blue-900/40 backdrop-blur-sm rounded-xl p-5 shadow-xl flex flex-col gap-3">
                    <label class="text-gray-300 font-semibold text-sm">Nombre de usuario</label>
                    <input
                        v-model="newUsername"
                        type="text"
                        maxlength="40"
                        class="bg-slate-700/80 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-blue-400 transition-colors"
                        placeholder="Tu nombre de usuario"
                    />
                </div>

                <!-- Equipamiento del avatar -->
                <div class="bg-blue-900/40 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden h-[320px] sm:h-[420px]">
                    <div class="px-5 pt-5 pb-3">
                        <label class="text-gray-300 font-semibold text-sm">Equipamiento del avatar</label>
                    </div>
                    <div class="h-[260px] sm:h-[360px]">
                        <AvatarProfile />
                    </div>
                </div>

                <!-- Acciones -->
                <div class="flex justify-end gap-3 pb-4">
                    <button
                        @click="router.back()"
                        class="px-5 py-2 rounded-lg text-gray-300 hover:text-white border border-slate-600 hover:border-slate-400 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        @click="save"
                        :disabled="saving || loadingProfile"
                        class="px-6 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-semibold transition-colors"
                    >
                        {{ loadingProfile ? 'Cargando perfil...' : saving ? 'Guardando...' : 'Guardar cambios' }}
                    </button>
                </div>
            </div>

        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth.store'
import { userService } from '@/api/user.service'
import AvatarProfile from './AvatarProfile.vue'
import EditProfile from './EditProfile.vue'
import { useEquipmentStore } from '@/stores/equipment.store'

const equipmentStore = useEquipmentStore()
const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const newUsername    = ref(auth.user?.username ?? '')
const selectedAvatar = ref(auth.user?.avatar   ?? '')
const selectedBanner = ref(auth.user?.banner   ?? '')
const loadingProfile = ref(false)
const saving         = ref(false)

onMounted(async () => {
    try {
        if (!auth.user?.id) {
            loadingProfile.value = true
            await auth.fetchMe()
        }
        newUsername.value    = auth.user?.username ?? ''
        selectedAvatar.value = auth.user?.avatar   ?? ''
        selectedBanner.value = auth.user?.banner   ?? ''

        await equipmentStore.fetchItems()

        console.log(equipmentStore.itemPool)
        if (!selectedAvatar.value && equipmentStore.itemPool.icon.length) {
            selectedAvatar.value = equipmentStore.itemPool.icon[0].image_url
        }
        if (!selectedBanner.value && equipmentStore.itemPool.banner.length) {
            selectedBanner.value = equipmentStore.itemPool.banner[0].image_url
        }
    } catch (e) {
        console.error('Error en onMounted:', e)
    } finally {
        loadingProfile.value = false
    }
})

async function save() {
    if (loadingProfile.value || saving.value) return
    if (!auth.user?.id) {
        toast.add({ severity: 'error', summary: 'Perfil no cargado', detail: 'No se pudo identificar al usuario. Recarga la página.', life: 4000 })
        return
    }
    if (!newUsername.value.trim()) {
        toast.add({ severity: 'warn', summary: 'Nombre requerido', detail: 'El nombre de usuario no puede estar vacío.', life: 3000 })
        return
    }

    saving.value = true
    try {
        const updates = {}
        if (newUsername.value.trim() !== auth.user?.username)       updates.username = newUsername.value.trim()
        if (selectedAvatar.value && selectedAvatar.value !== auth.user?.avatar) updates.avatar   = selectedAvatar.value
        if (selectedBanner.value && selectedBanner.value !== auth.user?.banner) updates.banner   = selectedBanner.value

        if (Object.keys(updates).length > 0) {
            await userService.update(auth.user.id, updates)
            await auth.fetchMe()
            toast.add({ severity: 'success', summary: 'Perfil actualizado', detail: 'Los cambios se han guardado correctamente.', life: 2500 })
        } else {
            toast.add({ severity: 'info', summary: 'Sin cambios', detail: 'No había nada nuevo que guardar.', life: 2500 })
        }
        router.back()
    } catch (e) {
        console.error('Error al guardar perfil:', e)
        toast.add({ severity: 'error', summary: 'Error al guardar', detail: e.response?.data?.message ?? 'No se pudieron guardar los cambios.', life: 4000 })
    } finally {
        saving.value = false
    }
}
</script>