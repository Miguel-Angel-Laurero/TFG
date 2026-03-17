<template>
  <div class="w-full p-4 flex flex-col items-center">
    <div class="w-full max-w-2xl">
      <ProgressBar :value="progress" class="h-4 mb-6" />
    </div>

    <div class="w-full flex justify-center">
      <component 
        v-if="selectedGame" 
        :is="selectedGame" 
        :key="route.query.game" 
      />
      <div v-else class="text-gray-400 mt-10">
        No se ha encontrado el juego: {{ route.query.game }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import Quiz from './Quiz.vue'
import FlashCard from './FlashCard.vue'
import ProgressBar from 'primevue/progressbar'
import { useGameProgress } from '@/composables/useGameProgress'
import FixTheBug from './FixTheBug.vue'
import CodeSorter from './CodeSorter.vue'

const route = useRoute()
const { progress, resetProgress } = useGameProgress()

// Mapeo de los nombres que vienen en la URL a los componentes importados
const games = {
  'Quiz': Quiz,
  'Flashcards': FlashCard,
  'FixTheBug': FixTheBug,
  'CodeSorter': CodeSorter
}

// Computada que reacciona a ?game=...
const selectedGame = computed(() => {
  const gameName = route.query.game // Captura "Flashcards" de la URL
  return games[gameName] || null
})

// Resetear la barra cada vez que cambie el juego en la URL
watch(() => route.query.game, () => {
  resetProgress()
})
</script>