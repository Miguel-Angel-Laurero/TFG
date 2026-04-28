<template>
    <transition name="slide-up">
        <div v-if="open && slotId" class="w-full h-1/2 z-50 absolute bg-slate-700/80 rounded-xl p-3 border border-white/10 flex-shrink-0">
            <div class="flex items-center justify-between mb-2">
                <span class="text-white font-semibold text-sm">Elige {{ slotNames[slotId] }}</span>
                <button class="text-white/40 hover:text-white text-xs" @click="$emit('close')">✕ cerrar</button>
            </div>
            <div class="flex gap-2 flex-wrap">
                <div
                    class="flex flex-col items-center gap-1 cursor-pointer p-2 rounded-lg border transition-colors w-16"
                    :class="!equipped[slotId]
                        ? 'border-red-400 bg-red-900/60'
                        : 'border-white/20 hover:border-red-400/50'"
                    @click="$emit('select', null)"
                >
                    <span class="text-2xl">🚫</span>
                    <span class="text-white/70 text-xs text-center leading-tight">Quitar</span>
                </div>
                <div
                    v-for="item in itemPool[slotId]" :key="item.id"
                    class="flex flex-col items-center gap-1 cursor-pointer p-2 rounded-lg border transition-colors w-16"
                    :class="equipped[slotId]?.id === item.id
                        ? 'border-indigo-400 bg-indigo-900/60'
                        : 'border-white/20 hover:border-white/50'"
                    @click="$emit('select', item)"
                >
                    <img :src="item.img" :alt="item.name" class="w-8 h-8 object-contain">
                    <span class="text-white/70 text-xs text-center leading-tight">{{ item.name }}</span>
                </div>
                <p v-if="!itemPool[slotId]?.length" class="text-xs text-slate-400 py-2">
                    No tienes objetos para este slot.
                </p>
            </div>
        </div>
    </transition>
</template>

<script setup>
defineProps({
    // Renombrado de "slot" (reservado en Vue) a "slotId"
    slotId:    { type: String, default: null },
    // open controla la visibilidad; antes se usaba v-if="slot" directamente
    open:      { type: Boolean, default: false },
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