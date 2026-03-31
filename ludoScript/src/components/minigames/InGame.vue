<template>
  <div class="relative w-full h-full">
    
    <!-- Confeti ocupa todo el contenedor padre -->
    <ConfettiBackground 
      v-if="gameFinished" 
      style="position: absolute; inset: 0; z-index: 0; pointer-events: none;" 
    />

    <!-- Contenido encima del confeti -->
    <div style="position: relative; z-index: 1;">
      
      <div class="w-full flex items-center p-4">
        <div class="flex-1 flex justify-start">
          <button
            @click="handleExit"
            class="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
          >
            Salir del minijuego
          </button>
        </div>
        <div class="flex-1 flex justify-center">
          <ProgressBar :value="progress" :show-value="false" class="h-4 w-full max-w-2xl" />
        </div>
        <div class="flex-1" />
      </div>

      <div class="w-full p-4 flex flex-col items-center">
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
import ConfettiBackground from '../shared/ConfettiBackground.vue'

import { useRouter } from 'vue-router'

const router = useRouter()

const route = useRoute()
const { progress, gameFinished, resetProgress } = useGameProgress()

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