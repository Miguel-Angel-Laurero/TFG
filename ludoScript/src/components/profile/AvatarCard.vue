<template>
    <Card
        class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900 !rounded-xl !text-gray-50"
        :style="{ width: width + 'px', height: height + 'px' }"
    >
        <template #content>
            <div class="relative w-full h-full">
                <img 
                    src="https://qdksdglsicumxhuozvxb.supabase.co/storage/v1/object/sign/images/customizable_pj.png?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV9mNGM2YmEzOS0yNzhhLTQxZDMtYjMwMy0xOGQ4NmEwMDdiYjUiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJpbWFnZXMvY3VzdG9taXphYmxlX3BqLnBuZyIsImlhdCI6MTc3NTA0Mzg5NywiZXhwIjoxODA2NTc5ODk3fQ._r4u-lZWe5F5YWDsvOxBXYv7_gaqduK7Fwy1ApxIlKM" 
                    alt="plantilla-pj"
                    class="relative w-[calc(100%-4px)] h-[calc(100%-96px)] object-contain"
                >
                <div
                    v-for="slot in slots" :key="slot.id"
                    class="rounded-xl absolute border-2 border-white/40"
                    :style="positions[slot.id]"
                >
                    <transition name="equip">
                        <img v-if="equipped[slot.id]" :key="equipped[slot.id]?.id"
                             :src="equipped[slot.id]?.img" class="w-full h-full object-fill">
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
})
</script>

<style scoped>
.equip-enter-active, .equip-leave-active { transition: all 0.3s ease; }
.equip-enter-from { opacity: 0; transform: translateY(-10px) scale(0.8); }
.equip-leave-to   { opacity: 0; transform: scale(1.2); }
</style>