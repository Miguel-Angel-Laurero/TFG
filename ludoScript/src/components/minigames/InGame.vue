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
            v-if="!gameFinished"
            @click="confirmExit"
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
import { computed, watch }      from 'vue'
import { useRoute }             from 'vue-router'
import ProgressBar              from 'primevue/progressbar'
import ConfettiBackground       from '../shared/ConfettiBackground.vue'
import Quiz                     from './Quiz.vue'
import FlashCard                from './FlashCard.vue'
import FixTheBug                from './FixTheBug.vue'
import CodeSorter               from './CodeSorter.vue'
import { useGameProgress }      from '@/composables/useGameProgress'
import { useGameExit }          from '@/composables/useGameExit'

const route = useRoute()
const { progress, gameFinished, resetProgress } = useGameProgress()
const { confirmExit } = useGameExit()

const games = {
  Quiz,
  Flashcards: FlashCard,
  FixTheBug,
  CodeSorter,
}

const selectedGame = computed(() => games[route.query.game] ?? null)

watch(() => route.query.game, resetProgress)
</script>