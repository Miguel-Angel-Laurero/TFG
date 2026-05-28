<template>
  <div>
    <Loading v-if="loadingManual" />
    <ActivityFinished
      v-else-if="finished"
      title="¡Repaso Completado!"
      message="Has terminado todas las preguntas del temario. Sigue practicando para afianzar el contenido."
      restart-label="Volver al principio"
      :earned-reward="earnedReward"
      @restart="handleRestart"
    >
      <template #extra>
        <!-- Stats: cajas glassmorphism con colores intensos -->
        <div class="grid grid-cols-2 gap-3 text-white">
          <div class="bg-emerald-500/20 border border-emerald-400/25 rounded-2xl p-4 flex flex-col items-center gap-1">
            <p class="text-3xl font-black text-emerald-300 tracking-tight">
              {{ correctCount }}
            </p>
            <p class="text-[0.6rem] uppercase tracking-widest text-emerald-400/70">
              Sabías
            </p>
          </div>
          <div class="bg-red-500/20 border border-red-400/25 rounded-2xl p-4 flex flex-col items-center gap-1">
            <p class="text-3xl font-black text-red-300 tracking-tight">
              {{ wrongCount }}
            </p>
            <p class="text-[0.6rem] uppercase tracking-widest text-red-400/70">
              A repasar
            </p>
          </div>
        </div>

        <!-- Botón adaptativo -->
        <div class="flex flex-col gap-2">
          <div
            v-if="!canUseAdaptive"
            class="bg-white/10 rounded-xl px-4 py-3"
          >
            <div class="flex items-center justify-between mb-2">
              <span class="text-white/70 text-xs font-medium">Desbloquea el modo adaptativo</span>
              <span class="text-white font-bold text-sm">
                {{ historyLoading ? '…' : gamesSinceLastAdaptive }}<span class="text-white/50 font-normal">/3
                  sesiones</span>
              </span>
            </div>
            <div class="w-full bg-white/10 rounded-full h-2">
              <div
                class="bg-violet-400 h-2 rounded-full transition-all duration-500"
                :style="{ width: historyLoading ? '0%' : `${Math.min(100, (gamesSinceLastAdaptive / 3) * 100)}%` }"
              />
            </div>
          </div>
          <button
            :disabled="!canUseAdaptive"
            :class="[
              'w-full py-3 px-8 rounded-xl font-bold transition-all',
              canUseAdaptive
                ? 'bg-violet-600 hover:bg-violet-500 text-white cursor-pointer'
                : 'bg-white/10 text-white/40 cursor-not-allowed'
            ]"
            @click="handleAdaptiveClick"
          >
            🎯 Repasar categorías débiles
          </button>
        </div>
      </template>
    </ActivityFinished>
    <FlashCardDeck
      v-else
      :card="currentItem"
      :current-index="currentIndex"
      :total-items="totalItems"
      :is-flipped="isFlipped"
      :is-last-item="isLastItem"
      @flip="toggleFlip"
      @mark-correct="handleMarkCorrect"
      @mark-wrong="handleMarkWrong"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useActivitySession } from '@/composables/useActivitySession'
import { useActivityReward } from '@/composables/useActivityReward'
import { useCategoryStats } from '@/composables/useCategoryStats'
import api from '@/api/axios'
import Loading from '../shared/Loading.vue'
import ActivityFinished from './ActivityFinished.vue'
import FlashCardDeck from './FlashCardDeck.vue'
import { useLoadingTimer } from '@/composables/useLoadingTimer'
import { toFlashCard, pickRandom, QUIZ_URL, FLASH_CARDS_PER_SESSION } from '@/composables/useFlashCardLoader'
import { useAdaptiveHistory } from '@/composables/useAdaptiveHistory'
import { gameService } from '@/api/game.service'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()

const {
  finished, currentIndex, currentItem, totalItems, isLastItem,
  loadDirect, next, restart,
} = useActivitySession(QUIZ_URL)

const loadingManual = ref(true)
const { withMinTime } = useLoadingTimer(loadingManual, 3000)

// Historial adaptativo (independiente del Quiz)
const {
  history: fcHistory,
  canUseAdaptive,
  remainingGames,
  gamesSinceLastAdaptive,
  historyLoading,
  loadHistory,
  markAdaptiveUsed,
  timeAgo,
} = useAdaptiveHistory('FlashCards')

watch(finished, (v) => { if (v) loadHistory() })

function handleAdaptiveClick() {
  markAdaptiveUsed()
  router.push({ path: '/in-game-view/', query: { game: 'FlashCards', adaptive: 'true' } })
}

async function loadFlashCards() {
  const cards = []

  // Cards de PDFs autenticados
  const pdfIds = route.query.pdfIds
    ? route.query.pdfIds.split(',')
    : route.query.pdfId
      ? [route.query.pdfId]
      : []

  for (const id of pdfIds) {
    try {
      const res = await api.get(`/pdfs/${id}/flashcards`)
      const data = Array.isArray(res.data) ? res.data : []
      cards.push(...data.map(fc => ({
        question: fc.question,
        answer: fc.answer,
        id: fc.id ?? null,
        category: fc.category ?? null,
        topic: fc.topic ?? null,
        difficulty: fc.difficulty ?? null,
      })))
    } catch (e) {
      console.error(`[FlashCard] Error cargando PDF ${id}:`, e)
    }
  }

  // Cards del banco de preguntas del Quiz (incluidas si no hay PDFs o si se pide explícitamente)
  const includeQuiz = pdfIds.length === 0 || route.query.includePredefined === 'true'
  if (includeQuiz) {
    try {
      const res = await fetch(QUIZ_URL)
      const allQ = await res.json()
      const selected = pickRandom(allQ, Math.min(FLASH_CARDS_PER_SESSION, allQ.length))
      cards.push(...selected.map(toFlashCard))
    } catch (e) {
      console.error('[FlashCard] Error cargando banco de preguntas:', e)
    }
  }

  await loadDirect(cards)
}

onMounted(async () => {
  await withMinTime(loadFlashCards)
})

// — Recompensas —
const { grantReward, earnedReward } = useActivityReward({ base: 25 })

// — Tracking de progreso por categoría —
const { trackAnswer, submitSession, resetSession } = useCategoryStats()

// — Estado local —
const isFlipped = ref(false)
const correctCount = ref(0)
const wrongCount = ref(0)

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}

async function handleNext() {
  if (isLastItem.value) {
    await submitSession()
    await grantReward()
    try {
      await gameService.createGame({
        gameName: 'FlashCards',
        score: correctCount.value,
        duration: 0,
        result: null,
      })
    } catch (_) { /* no bloquear si falla la red */ }
  }
  next(() => {
    isFlipped.value = false
  })
}

function handleMarkCorrect() {
  correctCount.value++
  const item = currentItem.value
  trackAnswer(item.category, true, item.id, item.difficulty, item.topic)
  handleNext()
}

function handleMarkWrong() {
  wrongCount.value++
  const item = currentItem.value
  trackAnswer(item.category, false, item.id, item.difficulty, item.topic)
  handleNext()
}

function handleRestart() {
  resetSession()
  correctCount.value = 0
  wrongCount.value = 0
  restart(() => {
    isFlipped.value = false
  })
}
</script>
