<template>
  <div class="flex flex-col gap-2 w-full max-w-full">
    <div
      v-for="slot in slots"
      :key="slot.id"
      class="aspect-square border-2 rounded-xl flex flex-col items-center justify-center cursor-pointer transition-colors w-full"
      :class="selected === slot.id
        ? 'border-indigo-400 bg-indigo-900/60'
        : 'border-white/30 bg-indigo-950/40 hover:border-white/60'"
      @click="$emit('pick', slot.id)"
    >
      <img
        v-if="equipped[slot.id]"
        :src="equipped[slot.id].img" 
        class="w-[75%] h-[75%] object-contain"
      >
            
      <template v-else>
        <div class="border border-dashed border-white/20 rounded-lg mb-1 w-1/2 h-1/2" />
        <span class="text-white/30 text-[min(2.5vw,12px)] text-center px-1 leading-none">
          {{ slot.nombre }}
        </span>
      </template>
    </div>
  </div>
</template>

<script setup>
defineProps({
    slots:    { type: Array,  required: true },
    equipped: { type: Object, required: true },
    selected: { type: String, default: null },
    // Eliminamos 'size' o lo dejamos solo como fallback
})
defineEmits(['pick'])
</script>