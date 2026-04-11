<template>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="flex flex-col items-center gap-3">
            <h3 class="font-bold text-lg text-white">Icono actual</h3>
            <div
                class="w-24 h-24 rounded-full border-2 border-dashed border-slate-500/80 bg-slate-700/60 flex items-center justify-center overflow-hidden"
            >
                <img v-if="avatar" :src="avatar" alt="Icono actual" class="w-full h-full object-cover">
                <span v-else class="text-3xl text-slate-300">?</span>
            </div>
            <button
                type="button"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                @click="$emit('edit-avatar')"
            >
                Editar icono
            </button>
        </div>

        <div class="flex flex-col items-center gap-3">
            <h3 class="font-bold text-lg text-white">Banner actual</h3>
            <div
                class="w-full h-24 rounded-xl border-2 border-dashed border-slate-500/80 bg-slate-700/60 overflow-hidden"
            >
                <img v-if="banner" :src="banner" alt="Banner actual" class="w-full h-full object-cover">
                <div v-else class="w-full h-full flex items-center justify-center text-slate-300 text-sm">
                    Sin banner seleccionado
                </div>
            </div>
            <button
                type="button"
                class="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold transition-colors cursor-pointer"
                @click="$emit('edit-banner')"
            >
                Editar banner
            </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    avatar: {
        type: String,
        default: '',
    },
    banner: {
        type: String,
        default: '',
    },
})

defineEmits(['edit-avatar', 'edit-banner'])
</script>

