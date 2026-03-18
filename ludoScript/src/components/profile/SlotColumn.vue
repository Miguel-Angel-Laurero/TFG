<template>
    <div class="flex flex-col gap-2">
        <div
            v-for="slot in slots" :key="slot.id"
            class="border-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors"
            :style="{ width: size + 'px', height: size + 'px' }"
            :class="selected === slot.id
                ? 'border-indigo-400 bg-indigo-900/60'
                : 'border-white/30 bg-indigo-950/40 hover:border-white/60'"
            @click="$emit('pick', slot.id)"
        >
            <img v-if="equipped[slot.id]" :src="equipped[slot.id].img" class="object-contain"
                 :style="{ width: size * 0.75 + 'px', height: size * 0.75 + 'px' }">
            <template v-else>
                <div class="border border-dashed border-white/20 rounded-lg mb-1"
                     :style="{ width: size * 0.5 + 'px', height: size * 0.5 + 'px' }"></div>
                <span class="text-white/30 text-xs">{{ slot.nombre }}</span>
            </template>
        </div>
    </div>
</template>

<script setup>
defineProps({
    slots:    { type: Array,  required: true },
    equipped: { type: Object, required: true },
    selected: { type: String, default: null },
    size:     { type: Number, default: 64 },
})
defineEmits(['pick'])
</script>