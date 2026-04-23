<template>
  <div class="relative h-full w-full overflow-x-hidden">

    <component :is="ConfettiBackground" v-if="showConfetti" style="position: absolute; inset: 0; z-index: 0; pointer-events: none;" />

    <div class="relative z-10 flex flex-col">

      <header class="w-full flex flex-col md:flex-row items-center gap-4 p-4 pb-16">
        <div class="flex-1 w-full flex justify-center md:justify-start order-2 md:order-1">
          <button v-if="!gameFinished" @click="confirmExit"
            class="w-full md:w-auto bg-red-500 text-white px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-bold hover:bg-red-600 transition-colors text-sm md:text-base shadow-lg">
            Salir del juego
          </button>
          <button v-if="gameFinished" @click="$router.push('/')"
            class="w-full md:w-auto px-4 py-2.5 md:px-6 md:py-3 rounded-xl font-bold transition-colors text-blue-300 bg-blue-900/40 border border-blue-700/50 hover:bg-blue-800/50 text-sm md:text-base">
            Volver al inicio
          </button>
        </div>

        <div class="flex-1 w-full flex justify-center order-1 md:order-2">
          <ProgressBar v-if="!showIntro" :value="progress" :show-value="false" class="h-3 md:h-4 w-full max-w-lg" />
        </div>

        <div class="hidden md:flex flex-1 order-3" />
      </header>

      <main class="w-full p-2 md:p-6 flex flex-col items-center flex-1">
        <div class="w-full max-w-5xl flex justify-center">
          <QuizIntro v-if="showIntro" @start="handleQuizStart" />
          <template v-else>
            <component 
              v-if="selectedGame" 
              :is="selectedGame" 
              v-bind="quizProps"
              class="w-full"
              :key="`${route.query.game}-${route.query.pdfIds ?? route.query.pdfId ?? ''}`" 
            />
            <div v-else class="text-gray-400 mt-10 flex flex-col items-center">
              <i class="pi pi-exclamation-triangle text-4xl mb-2"></i>
              <p>No se ha encontrado el juego: {{ route.query.game }}</p>
            </div>
          </template>
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import { computed, watch, ref, onMounted, defineAsyncComponent } from 'vue'
import { useRoute } from 'vue-router'
import ProgressBar from 'primevue/progressbar'
import Quiz from './Quiz.vue'
import QuizIntro from './QuizIntro.vue'
import FlashCard from './FlashCard.vue'
import { useGameProgress } from '@/composables/useGameProgress'
import { useGameExit } from '@/composables/useGameExit'

const route = useRoute()
const { progress, gameFinished, resetProgress, score } = useGameProgress()
const { confirmExit } = useGameExit()

const ConfettiBackground = defineAsyncComponent(() => import('../shared/ConfettiBackground.vue'))

const showConfetti = computed(() => gameFinished.value && score.value >= 5)

const showIntro = ref(route.query.game === 'Quiz')

onMounted(() => resetProgress())

const games = {
  Quiz,
  FlashCards: FlashCard,
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