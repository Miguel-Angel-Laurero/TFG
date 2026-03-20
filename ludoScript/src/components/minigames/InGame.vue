<template>
  <button
    @click="handleExit"
    class="bg-red-500 text-white px-6 py-3 m-4 rounded-xl font-bold hover:bg-red-600 transition-colors flex justify-left"
  >
    Salir del minijuego
  </button>
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

import { useRouter } from 'vue-router'

const router = useRouter()

const route = useRoute()
const { progress, resetProgress } = useGameProgress()

// Mapeo de los nombres que vienen en la URL a los componentes importados
const games = {
  'Quiz': Quiz,
  'Flashcards': FlashCard,
  'FixTheBug': FixTheBug,
  'CodeSorter': CodeSorter
}
const handleExit = () => {
  //para personalizar estilos no se puede usar confirm hay que hacerlo a mano
  //revisar el confirm de primevue
  if (confirm("¿Seguro que quieres salir del minijuego? Se perderá el progreso actual")) {
    router.push('/')
  }
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