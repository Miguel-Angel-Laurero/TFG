<template>
  <div v-if="progress === 100" class="flex flex-col h-full items-center gap-10 p-16 bg-emerald-600/80 rounded-2xl border-emerald-600">
    <div class="text-white text-xl rounded-xl p-4 font-bold transition-all">
      <p>¡Repaso Completado!</p>
      <p class="text-sm">Has terminado todas las preguntas del temario. Sigue practicando para afianzar el contenido</p>
    </div>
    <button @click.stop="handleRestart" class="hover:bg-white border border-gray-200 rounded-xl p-4 hover:cursor-pointer font-bold transition-all">
      Volver al principio
    </button>
  </div>

  <div v-else class="flex flex-col items-center gap-8 p-10">
    <p class="text-white">Pregunta: {{ currentIndex + 1 }} / {{ initialCards.length }}</p>

    <div v-if="currentCard" class="w-96 h-64 cursor-pointer" style="perspective: 1000px" @click="flip">
      <div
        class="relative w-full h-full transition-all duration-700"
        :style="{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }"
      >
        <!-- Frente: Pregunta -->
        <div
          class="absolute inset-0 bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8"
          style="backface-visibility: hidden"
        >
          <span class="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Pregunta</span>
          <p class="text-2xl font-bold text-gray-800 text-center">{{ currentCard.question }}</p>
        </div>

        <!-- Reverso: Respuesta -->
        <div
          class="absolute inset-0 bg-sky-200 border border-gray-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8"
          style="backface-visibility: hidden; transform: rotateY(180deg)"
        >
          <span class="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Respuesta</span>
          <p class="text-2xl font-semibold text-gray-600 text-center">{{ currentCard.answer }}</p>
        </div>
      </div>
    </div>

    <p
      class="text-xs text-white/45 font-medium transition-opacity duration-300"
      :class="isFlipped ? 'opacity-0' : 'opacity-100'"
    >
      Toca la carta para ver la respuesta
    </p>

    <button
      v-if="progress < 100"
      @click.stop="handleNext"
      class="bg-white border border-gray-200 text-black rounded-xl p-4 hover:cursor-pointer font-bold transition-all"
    >
      Siguiente Carta →
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useFlashcards } from '@/composables/useFlashCards'
import { useGameProgress } from '@/composables/useGameProgress'

const { progress, updateProgress } = useGameProgress()
const initialCards = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const response = await fetch('/flashCards.json')
    initialCards.value = await response.json()
    updateProgress(0)
  } catch (error) {
    console.error("Error al cargar los datos", error)
  } finally {
    loading.value = false
  }
})

const { currentCard, isFlipped, flip, next, restart, currentIndex } = useFlashcards(initialCards)

const handleNext = () => {
  const total = initialCards.value.length
  if (currentIndex.value === total - 1) {
    updateProgress(100)  // marca como completado sin avanzar
  } else {
    next()
  }
}

const handleRestart = () => {
  restart()
  updateProgress(0)
}

// El watch solo actualiza progreso intermedio (no el 100%, lo gestiona handleNext)
watch(currentIndex, (newVal) => {
  const total = initialCards.value.length
  if (total > 0 && newVal > 0 && newVal < total) {
    updateProgress(Math.round((newVal / total) * 100))
  }
})
</script>