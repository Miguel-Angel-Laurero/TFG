<template>
  <Card
  class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900
         !rounded-xl !text-gray-50 w-full max-w-[300px]  max-h-[350px] mx-auto overflow-hidden flex flex-col aspect-[3/5]"
>

  >
    <template #content>
      <div class="relative w-full h-full flex items-center justify-center">
        <img
          :src="IMAGES.pj"
          alt="plantilla-pj"
          class="max-w-full max-h-full object-contain block mx-auto"
        />
      </div>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'

import { IMAGES } from '@/utils/imgBucketStorage';

defineProps({
    width:  { type: Number, default: 160 },
    height: { type: Number, default: 350 },
})
</script>

<style scoped>
.equip-enter-active, .equip-leave-active { transition: all 0.3s ease; }
.equip-enter-from { opacity: 0; transform: translateY(-10px) scale(0.8); }
.equip-leave-to   { opacity: 0; transform: scale(1.2); }
</style>