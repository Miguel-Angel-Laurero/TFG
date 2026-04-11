<template>
    <div class="flex flex-col gap-6">
        <div class="bg-slate-800/90 backdrop-blur-sm rounded-xl p-5 shadow-xl">
            <h2 class="text-white font-bold text-2xl mb-1">Editar Perfil</h2>
            <p class="text-gray-400 text-sm">Actualiza tu nombre de usuario, tu icono y tu banner.</p>
        </div>

        <div class="bg-slate-800/90 backdrop-blur-sm rounded-xl p-5 shadow-xl flex flex-col gap-3">
            <label class="text-gray-300 font-semibold text-sm">Nombre de usuario</label>
            <input
                v-model="newUsername"
                type="text"
                maxlength="40"
                class="bg-slate-700/80 text-white rounded-lg px-4 py-2 border border-slate-600 focus:outline-none focus:border-blue-400 transition-colors"
                placeholder="Tu nombre de usuario"
            />
        </div>

        <div class="bg-slate-800/90 backdrop-blur-sm rounded-xl p-5 shadow-xl flex flex-col gap-3">
            <label class="text-gray-300 font-semibold text-sm">Imagen de perfil</label>
            <p class="text-xs text-gray-400">Se muestran tu icono y banner actuales. Usa los botones para abrir el selector.</p>
            <EditProfile
                :avatar="selectedAvatar"
                :banner="selectedBanner"
                @edit-avatar="openSelector('avatar')"
                @edit-banner="openSelector('banner')"
            />
        </div>

        <div class="bg-slate-800/90 backdrop-blur-sm rounded-xl shadow-xl overflow-hidden" style="height: 420px;">
            <div class="px-5 pt-5 pb-3">
                <label class="text-gray-300 font-semibold text-sm">Equipamiento del avatar</label>
            </div>
            <div class="h-[360px]">
                <AvatarProfile />
            </div>
        </div>

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

        <div
            v-if="selectorOpen"
            class="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 px-4"
            @click.self="closeSelector"
        >
            <div class="w-full max-w-4xl rounded-2xl border border-slate-700 bg-slate-900 shadow-2xl">
                <div class="flex items-center justify-between border-b border-slate-700 px-6 py-4">
                    <div>
                        <h3 class="text-lg font-bold text-white">{{ selectorTitle }}</h3>
                        <p class="text-sm text-slate-400">Selecciona una imagen y luego guarda los cambios del perfil.</p>
                    </div>
                    <button
                        type="button"
                        class="text-slate-400 hover:text-white transition-colors"
                        @click="closeSelector"
                    >
                        Cerrar
                    </button>
                </div>

                <div class="max-h-[70vh] overflow-y-auto p-6">
                    <div v-if="loadingOptions" class="py-10 text-center text-slate-400">
                        Cargando opciones...
                    </div>

                    <div v-else-if="currentOptions.length === 0" class="py-10 text-center text-slate-400">
                        No hay opciones disponibles.
                    </div>

                    <div v-else class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                        <button
                            v-for="option in currentOptions"
                            :key="option.id"
                            type="button"
                            class="rounded-xl border p-3 transition-all"
                            :class="isSelected(option.img)
                                ? 'border-blue-400 bg-blue-500/10'
                                : 'border-slate-700 bg-slate-800 hover:border-slate-500'"
                            @click="selectVisual(option.img)"
                        >
                            <div
                                class="overflow-hidden rounded-lg bg-slate-700/60"
                                :class="selectorType === 'avatar' ? 'aspect-square p-4' : 'h-24'"
                            >
                                <img
                                    :src="option.img"
                                    :alt="option.name"
                                    class="w-full h-full"
                                    :class="selectorType === 'avatar' ? 'object-contain' : 'object-cover'"
                                >
                            </div>
                            <p class="mt-3 text-sm font-medium text-white">{{ option.name }}</p>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useToast } from 'primevue/usetoast'
import { useAuthStore } from '@/stores/auth.store'
import { userService } from '@/api/user.service'
import AvatarProfile from './AvatarProfile.vue'
import EditProfile from './EditProfile.vue'

const router = useRouter()
const auth = useAuthStore()
const toast = useToast()

const newUsername = ref(auth.user?.username ?? '')
const selectedAvatar = ref(auth.user?.avatar ?? '')
const selectedBanner = ref(auth.user?.banner ?? '')
const iconOptions = ref([])
const bannerOptions = ref([])
const loadingOptions = ref(true)
const loadingProfile = ref(false)
const saving = ref(false)
const selectorOpen = ref(false)
const selectorType = ref('avatar')

const currentOptions = computed(() =>
    selectorType.value === 'avatar' ? iconOptions.value : bannerOptions.value
)

const selectorTitle = computed(() =>
    selectorType.value === 'avatar' ? 'Selecciona tu icono de perfil' : 'Selecciona tu banner de perfil'
)

onMounted(async () => {
    try {
        if (!auth.user?.id) {
            loadingProfile.value = true
            await auth.fetchMe()
        }

        newUsername.value = auth.user?.username ?? ''
        selectedAvatar.value = auth.user?.avatar ?? ''
        selectedBanner.value = auth.user?.banner ?? ''

        const res = await fetch('/itemData.json')
        const all = await res.json()
        iconOptions.value = all.filter(item => item.category === 'icons')
        bannerOptions.value = all.filter(item => item.category === 'banners')

        if (!selectedAvatar.value && iconOptions.value.length > 0) {
            selectedAvatar.value = iconOptions.value[0].img
        }

        if (!selectedBanner.value && bannerOptions.value.length > 0) {
            selectedBanner.value = bannerOptions.value[0].img
        }
    } catch (_) {
        // Si falla la carga, se mantienen los valores actuales del usuario.
    } finally {
        loadingProfile.value = false
        loadingOptions.value = false
    }
})

function openSelector(type) {
    selectorType.value = type
    selectorOpen.value = true
}

function closeSelector() {
    selectorOpen.value = false
}

function selectVisual(img) {
    if (selectorType.value === 'avatar') {
        selectedAvatar.value = img
    } else {
        selectedBanner.value = img
    }

    closeSelector()
}

function isSelected(img) {
    return selectorType.value === 'avatar'
        ? selectedAvatar.value === img
        : selectedBanner.value === img
}

async function save() {
    if (loadingProfile.value || saving.value) return
    if (!auth.user?.id) {
        toast.add({
            severity: 'error',
            summary: 'Perfil no cargado',
            detail: 'No se pudo identificar al usuario actual. Recarga la página e inténtalo de nuevo.',
            life: 4000,
        })
        return
    }
    if (!newUsername.value.trim()) {
        toast.add({
            severity: 'warn',
            summary: 'Nombre requerido',
            detail: 'El nombre de usuario no puede estar vacío.',
            life: 3000,
        })
        return
    }

    saving.value = true
    try {
        const updates = {}
        if (newUsername.value.trim() !== auth.user?.username) {
            updates.username = newUsername.value.trim()
        }
        if (selectedAvatar.value && selectedAvatar.value !== auth.user?.avatar) {
            updates.avatar = selectedAvatar.value
        }
        if (selectedBanner.value && selectedBanner.value !== auth.user?.banner) {
            updates.banner = selectedBanner.value
        }
        if (Object.keys(updates).length > 0) {
            await userService.update(auth.user.id, updates)
            await auth.fetchMe()
            toast.add({
                severity: 'success',
                summary: 'Perfil actualizado',
                detail: 'Los cambios se han guardado correctamente.',
                life: 2500,
            })
        } else {
            toast.add({
                severity: 'info',
                summary: 'Sin cambios',
                detail: 'No había nada nuevo que guardar.',
                life: 2500,
            })
        }
        router.back()
    } catch (e) {
        console.error('Error al guardar perfil:', e)
        toast.add({
            severity: 'error',
            summary: 'Error al guardar',
            detail: e.response?.data?.message ?? 'No se pudieron guardar los cambios.',
            life: 4000,
        })
    } finally {
        saving.value = false
    }
}
</script>
