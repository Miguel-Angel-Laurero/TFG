<template>
  <div class="flex flex-col items-center gap-8 p-10">

    <!-- Contador -->
    <p class="text-white">Pregunta: {{ currentIndex + 1 }} / {{ totalItems }}</p>

    <!-- Carta con volteo 3D -->
    <div class="w-96 h-64 cursor-pointer" style="perspective: 1000px" @click="emit('flip')">
      <div class="relative w-full h-full transition-all duration-700" :style="{
        transformStyle: 'preserve-3d',
        transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
      }">
        <!-- Frente: Pregunta -->
        <div
          class="absolute inset-0 bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8"
          style="backface-visibility: hidden">
          <span class="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Pregunta</span>
          <p class="text-2xl font-bold text-gray-800 text-center">{{ card.question }}</p>
        </div>

        <!-- Reverso: Respuesta -->
        <div
          class="absolute inset-0 bg-sky-200 border border-gray-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8"
          style="backface-visibility: hidden; transform: rotateY(180deg)">
          <span class="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Respuesta</span>
          <p class="text-2xl font-semibold text-gray-600 text-center">{{ card.answer }}</p>
        </div>
      </div>
    </div>

    <!-- Hint (solo visible en el anverso) -->
    <p class="text-xs text-white/45 font-medium transition-opacity duration-300"
      :class="isFlipped ? 'opacity-0 pointer-events-none' : 'opacity-100'">
      Toca la carta para ver la respuesta
    </p>

    <!-- Botones de marcado (solo visibles en el reverso) -->
    <div class="flex gap-4 transition-opacity duration-300"
      :class="isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'">
      <button @click.stop="emit('mark-correct')"
        class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl px-6 py-3 font-bold transition-colors cursor-pointer"
        :aria-label="isLastItem ? 'Lo sabía · Finalizar repaso' : 'Lo sabía · Siguiente'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M16.707 5.293a1 1 0 00-1.414 0L8 12.586 4.707 9.293a1 1 0 00-1.414 1.414l4 4a1 1 0 001.414 0l8-8a1 1 0 000-1.414z"
            clip-rule="evenodd" />
        </svg>
        Lo sabía
      </button>

      <button @click.stop="emit('mark-wrong')"
        class="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white rounded-xl px-6 py-3 font-bold transition-colors cursor-pointer"
        :aria-label="isLastItem ? 'No lo sabía · Finalizar repaso' : 'No lo sabía · Siguiente'">
        <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
          <path fill-rule="evenodd"
            d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
            clip-rule="evenodd" />
        </svg>
        No lo sabía
      </button>
    </div>

  </div>
</template>

<script setup>
// Componente presentacional puro: no contiene estado ni lógica de negocio.
// Todo el estado (isFlipped, índice…) vive en FlashCard.vue y llega como prop.
defineProps({
  card: { type: Object, required: true },
  currentIndex: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  isFlipped: { type: Boolean, required: true },
  isLastItem: { type: Boolean, required: true },
})

const emit = defineEmits(['flip', 'mark-correct', 'mark-wrong'])
</script>
