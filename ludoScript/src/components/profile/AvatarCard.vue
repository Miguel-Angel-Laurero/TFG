<template>
    <Card
        class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900 !rounded-xl !text-gray-50"
        :style="{ width: width + 'px', height: height + 'px' }"
    >
        <template #content>
            <div class="relative w-full h-full">
                <div
                    v-for="slot in slots" :key="slot.id"
                    class="border border-gray-50/20 rounded-xl absolute"
                    :style="{ width: slotSize + 'px', height: slotSize + 'px', ...positions[slot.id] }"
                >
                    <transition name="equip">
                        <img v-if="equipped[slot.id]" :key="equipped[slot.id]?.id"
                             :src="equipped[slot.id]?.img" class="w-full h-full object-contain">
                    </transition>
                </div>
            </div>
        </template>
    </Card>
</template>

<script setup>
import Card from 'primevue/card'

defineProps({
    slots:     { type: Array,  required: true },
    equipped:  { type: Object, required: true },
    positions: { type: Object, required: true },
    width:     { type: Number, default: 160 },
    height:    { type: Number, default: 256 },
    slotSize:  { type: Number, default: 64 },
})
</script>

<style scoped>
.equip-enter-active, .equip-leave-active { transition: all 0.3s ease; }
.equip-enter-from { opacity: 0; transform: translateY(-10px) scale(0.8); }
.equip-leave-to   { opacity: 0; transform: scale(1.2); }
</style>