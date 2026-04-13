<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- ICONO -->
        <div class="flex flex-col items-center gap-3">
            <h3 class="font-bold text-lg text-white">Icono actual</h3>
            <div class="w-24 h-24 rounded-full border-2 border-dashed border-slate-500/80 bg-slate-700/60 flex items-center justify-center overflow-hidden">
                <img v-if="avatar" :src="avatar" alt="Icono actual" class="w-full h-full object-cover">
                <span v-else class="text-3xl text-slate-300">?</span>
            </div>
            <button
                type="button"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                @click="togglePicker('icon')"
            >
                Editar icono
            </button>

            <!-- Picker de iconos adquiridos -->
            <Transition name="fade">
                <div v-if="openPicker === 'icon'" class="flex flex-wrap gap-2 justify-center max-w-xs">
                    <p v-if="!iconPool.length" class="text-xs text-slate-400">No tienes iconos desbloqueados</p>
                    <button
                        v-for="item in iconPool"
                        :key="item.id"
                        type="button"
                        :class="[
                            'w-12 h-12 rounded-full overflow-hidden border-2 transition-all',
                            avatar === item.image_url
                                ? 'border-blue-400 scale-110 shadow-lg shadow-blue-500/30'
                                : 'border-slate-600 hover:border-blue-300'
                        ]"
                        @click="$emit('select-avatar', item.image_url)"
                    >
                        <img :src="item.image_url" :alt="item.name" class="w-full h-full object-cover">
                    </button>
                </div>
            </Transition>
        </div>

        <!-- BANNER -->
        <div class="flex flex-col items-center gap-3">
            <h3 class="font-bold text-lg text-white">Banner actual</h3>
            <div class="w-full h-24 rounded-xl border-2 border-dashed border-slate-500/80 bg-slate-700/60 overflow-hidden">
                <img v-if="banner" :src="banner" alt="Banner actual" class="w-full h-full object-cover">
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300 text-sm">
                    Sin banner seleccionado
                </div>
            </div>
            <button
                type="button"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                @click="togglePicker('banner')"
            >
                Editar banner
            </button>

            <!-- Picker de banners adquiridos -->
            <Transition name="fade">
                <div v-if="openPicker === 'banner'" class="flex flex-wrap gap-2 justify-center max-w-xs">
                    <p v-if="!bannerPool.length" class="text-xs text-slate-400">No tienes banners desbloqueados</p>
                    <button
                        v-for="item in bannerPool"
                        :key="item.id"
                        type="button"
                        :class="[
                            'w-20 h-10 rounded-lg overflow-hidden border-2 transition-all',
                            banner === item.image_url
                                ? 'border-blue-400 scale-105 shadow-lg shadow-blue-500/30'
                                : 'border-slate-600 hover:border-blue-300'
                        ]"
                        @click="$emit('select-banner', item.image_url)"
                    >
                        <img :src="item.image_url" :alt="item.name" class="w-full h-full object-cover">
                    </button>
                </div>
            </Transition>
        </div>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useEquipmentStore } from '@/stores/equipment.store'
import { watch } from 'vue'
defineProps({
    avatar: { type: String, default: '' },
    banner: { type: String, default: '' },
})

defineEmits(['select-avatar', 'select-banner'])

const store = useEquipmentStore()
const openPicker = ref(null) // 'icon' | 'banner' | null

const iconPool   = computed(() => store.itemPool.icon   ?? [])
const bannerPool = computed(() => store.itemPool.banner ?? [])
watch(() => store.itemPool.icon,   v => console.log('iconPool →', v), { immediate: true })
watch(() => store.itemPool.banner, v => console.log('bannerPool →', v), { immediate: true })
watch(() => store.loading,         v => console.log('loading →', v), { immediate: true })

function togglePicker(type) {
    openPicker.value = openPicker.value === type ? null : type
}
</script>

<style scoped>
.fade-enter-active, .fade-leave-active { transition: opacity 0.2s, transform 0.2s; }
.fade-enter-from, .fade-leave-to { opacity: 0; transform: translateY(-4px); }
</style>