<template>
    <transition name="slide-up">
        <div v-if="slot" class="w-1/2 h-1/2 z-50 absolute bg-slate-700/80 rounded-xl p-3 border border-white/10 flex-shrink-0">
            <div class="flex items-center justify-between mb-2">
                <span class="text-white font-semibold text-sm">Elige {{ slotNames[slot] }}</span>
                <button class="text-white/40 hover:text-white text-xs" @click="$emit('close')">✕ cerrar</button>
            </div>
            <div class="flex gap-2 flex-wrap">
                <div
                    v-for="item in itemPool[slot]" :key="item.id"
                    class="flex flex-col items-center gap-1 cursor-pointer p-2 rounded-lg border transition-colors w-16"
                    :class="equipped[slot]?.id === item.id
                        ? 'border-indigo-400 bg-indigo-900/60'
                        : 'border-white/20 hover:border-white/50'"
                    @click="$emit('select', item)"
                >
                    <img :src="item.img" :alt="item.nombre" class="w-8 h-8 object-contain">
                    <span class="text-white/70 text-xs text-center leading-tight">{{ item.nombre }}</span>
                </div>
            </div>
        </div>
    </transition>
</template>

<script setup>
defineProps({
    slot:      { type: String, default: null },
    equipped:  { type: Object, required: true },
    itemPool:  { type: Object, required: true },
    slotNames: { type: Object, required: true },
})
defineEmits(['close', 'select'])
</script>

<style scoped>
.slide-up-enter-active, .slide-up-leave-active { transition: all 0.25s ease; }
.slide-up-enter-from { opacity: 0; transform: translateY(8px); }
.slide-up-leave-to   { opacity: 0; transform: translateY(8px); }
</style>