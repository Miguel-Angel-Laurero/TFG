<template>
  <div class="flex flex-col items-center gap-8 p-10">

    <!-- Contador -->
    <p class="text-white">Pregunta: {{ currentIndex + 1 }} / {{ totalItems }}</p>

    <!-- Carta con volteo 3D -->
    <div
      class="w-96 h-64 cursor-pointer"
      style="perspective: 1000px"
      @click="emit('flip')"
    >
      <div
        class="relative w-full h-full transition-all duration-700"
        :style="{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
        }"
      >
        <!-- Frente: Pregunta -->
        <div
          class="absolute inset-0 bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8"
          style="backface-visibility: hidden"
        >
          <span class="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Pregunta</span>
          <p class="text-2xl font-bold text-gray-800 text-center">{{ card.question }}</p>
        </div>

        <!-- Reverso: Respuesta -->
        <div
          class="absolute inset-0 bg-sky-200 border border-gray-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8"
          style="backface-visibility: hidden; transform: rotateY(180deg)"
        >
          <span class="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Respuesta</span>
          <p class="text-2xl font-semibold text-gray-600 text-center">{{ card.answer }}</p>
        </div>
      </div>
    </div>

    <!-- Hint -->
    <p
      class="text-xs text-white/45 font-medium transition-opacity duration-300"
      :class="isFlipped ? 'opacity-0' : 'opacity-100'"
    >
      Toca la carta para ver la respuesta
    </p>

    <!-- Botón siguiente -->
    <button
      @click.stop="emit('next')"
      class="bg-white border border-gray-200 text-black rounded-xl p-4 hover:cursor-pointer font-bold transition-all"
    >
      {{ isLastItem ? 'Finalizar repaso' : 'Siguiente Carta →' }}
    </button>

  </div>
</template>

<script setup>
// Componente presentacional puro: no contiene estado ni lógica de negocio.
// Todo el estado (isFlipped, índice…) vive en FlashCard.vue y llega como prop.
defineProps({
  card:         { type: Object,  required: true },
  currentIndex: { type: Number,  required: true },
  totalItems:   { type: Number,  required: true },
  isFlipped:    { type: Boolean, required: true },
  isLastItem:   { type: Boolean, required: true },
})

const emit = defineEmits(['flip', 'next'])
</script>
