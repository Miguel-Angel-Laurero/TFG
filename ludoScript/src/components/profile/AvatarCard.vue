<template>
    <Card
        class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900 !rounded-xl !text-gray-50"
        :style="{ width: width + 'px', height: height + 'px' }"
    >
        <template #content>
            <div class="relative w-full h-full">
                <img 
                    :src="IMAGES.pj" 
                    alt="plantilla-pj"
                    class="relative w-[calc(100%-4px)] h-[calc(100%-96px)] object-contain"
                >
            </div>
        </template>
    </Card>
</template>

<script setup>
import Card from 'primevue/card'

import { IMAGES } from '@/utils/imgBucketStorage';

defineProps({
    width:  { type: Number, default: 160 },
    height: { type: Number, default: 256 },
})
</script>

<style scoped>
.equip-enter-active, .equip-leave-active { transition: all 0.3s ease; }
.equip-enter-from { opacity: 0; transform: translateY(-10px) scale(0.8); }
.equip-leave-to   { opacity: 0; transform: scale(1.2); }
</style>