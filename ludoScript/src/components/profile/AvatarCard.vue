<template>
  <Card
  class="border-2 !border-gray-50 !bg-radial from-indigo-700 from-20% to-indigo-900
         !rounded-xl !text-gray-50 w-full max-w-[300px]  max-h-[350px] mx-auto overflow-hidden flex flex-col aspect-[3/5]"
>
  >
    <template #content>
      <Character/>
    </template>
  </Card>
</template>

<script setup>
import Card from 'primevue/card'
import Character from './Character.vue';

defineProps({
    width:  { type: Number, default: 160 },
    height: { type: Number, default: 350 },
})
</script>