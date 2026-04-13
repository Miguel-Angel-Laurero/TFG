<template>
  <div>
    <Loading v-if="loadingManual" />
    <ActivityFinished v-else-if="finished" title="¡Repaso Completado!"
      message="Has terminado todas las preguntas del temario. Sigue practicando para afianzar el contenido."
      restart-label="Volver al principio" @restart="handleRestart" />
    <FlashCardDeck v-else :card="currentItem" :current-index="currentIndex" :total-items="totalItems"
      :is-flipped="isFlipped" :is-last-item="isLastItem" @flip="toggleFlip" @mark-correct="handleMarkCorrect"
      @mark-wrong="handleMarkWrong" />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useActivitySession } from '@/composables/useActivitySession'
import { useActivityReward } from '@/composables/useActivityReward'
import { useCategoryStats } from '@/composables/useCategoryStats'
import api from '@/api/axios'
import Loading from '../shared/Loading.vue'
import ActivityFinished from './ActivityFinished.vue'
import FlashCardDeck from './FlashCardDeck.vue'
import { useLoadingTimer } from '@/composables/useLoadingTimer'
import { toFlashCard, pickRandom, QUIZ_URL, FLASH_CARDS_PER_SESSION } from '@/composables/useFlashCardLoader'

const route = useRoute()

const {
  finished, currentIndex, currentItem, totalItems, isLastItem,
  loadDirect, next, restart,
} = useActivitySession(QUIZ_URL)

const loadingManual = ref(true)
const { withMinTime } = useLoadingTimer(loadingManual, 3000)

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
const { grantReward } = useActivityReward({ base: 25 })

// — Tracking de progreso por categoría —
const { trackAnswer, submitSession, resetSession } = useCategoryStats()

// — Estado local —
const isFlipped = ref(false)

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}

async function handleNext() {
  if (isLastItem.value) {
    await submitSession()
    await grantReward()
  }
  next(() => {
    isFlipped.value = false
  })
}

function handleMarkCorrect() {
  const item = currentItem.value
  trackAnswer(item.category, true, item.id, item.difficulty, item.topic)
  handleNext()
}

function handleMarkWrong() {
  const item = currentItem.value
  trackAnswer(item.category, false, item.id, item.difficulty, item.topic)
  handleNext()
}

function handleRestart() {
  resetSession()
  restart(() => {
    isFlipped.value = false
  })
}
</script>
