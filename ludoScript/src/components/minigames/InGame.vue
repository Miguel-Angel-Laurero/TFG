<template>
  <div class="relative w-full h-full">

    <!-- Confeti ocupa todo el contenedor padre -->
    <ConfettiBackground v-if="gameFinished" style="position: absolute; inset: 0; z-index: 0; pointer-events: none;" />

    <!-- Contenido encima del confeti -->
    <div style="position: relative; z-index: 1;">

      <div class="w-full flex items-center p-4">
        <div class="flex-1 flex justify-start">
          <!-- During intro or game: exit with confirmation -->
          <button v-if="!gameFinished" @click="confirmExit"
            class="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors">
            Salir del minijuego
          </button>
          <!-- After game: go home without confirmation -->
          <button v-if="gameFinished" @click="$router.push('/')"
            class="px-6 py-3 rounded-xl font-bold transition-colors text-blue-300 bg-blue-900/40 border border-blue-700/50 hover:bg-blue-800/50">
            Volver al inicio
          </button>
        </div>
        <div class="flex-1 flex justify-center">
          <ProgressBar v-if="!showIntro" :value="progress" :show-value="false" class="h-4 w-full max-w-2xl" />
        </div>
        <div class="flex-1" />
      </div>

      <div class="w-full p-4 flex flex-col items-center">
        <div class="w-full flex justify-center">
          <QuizIntro v-if="showIntro" @start="handleQuizStart" />
          <template v-else>
            <component v-if="selectedGame" :is="selectedGame" v-bind="quizProps"
              :key="`${route.query.game}-${route.query.pdfIds ?? route.query.pdfId ?? ''}`" />
            <div v-else class="text-gray-400 mt-10">
              No se ha encontrado el juego: {{ route.query.game }}
            </div>
          </template>
        </div>
      </div>

    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import ProgressBar from 'primevue/progressbar'
import ConfettiBackground from '../shared/ConfettiBackground.vue'
import Quiz from './Quiz.vue'
import QuizIntro from './QuizIntro.vue'
import FlashCard from './FlashCard.vue'
import { useGameProgress } from '@/composables/useGameProgress'
import { useGameExit } from '@/composables/useGameExit'

const route = useRoute()
const { progress, gameFinished, resetProgress } = useGameProgress()
const { confirmExit } = useGameExit()

// Show rules intro only for Quiz
const showIntro = ref(route.query.game === 'Quiz')

// Reset progress on every mount so stale gameFinished from a previous session
// does not bleed into the intro screen (confetti bug).
onMounted(() => resetProgress())

const games = {
  Quiz,
  Flashcards: FlashCard,
}

const selectedGame = computed(() => games[route.query.game] ?? null)

const quizProps = computed(() => ({}))

function handleQuizStart() {
  showIntro.value = false
}

watch(() => route.query.game, (game) => {
  resetProgress()
  showIntro.value = game === 'Quiz'
})
</script>