<template>
  <ActivityLoading v-if="loading" />

  <ActivityFinished v-else-if="finished" title="Resultado final" restart-label="Volver a intentarlo"
    :earned-reward="earnedReward" :rank-label="rankLabel" :rank-color="rankColor" @restart="handleRestart">
    <template #extra>
      <div class="grid grid-cols-3 gap-4 text-white">
        <div class="bg-emerald-500/30 rounded-2xl p-4">
          <p class="text-3xl font-bold">{{ correctCount }}</p>
          <p class="text-sm mt-1 text-emerald-200">Correctas</p>
        </div>
        <div class="bg-red-500/30 rounded-2xl p-4">
          <p class="text-3xl font-bold">{{ wrongCount }}</p>
          <p class="text-sm mt-1 text-red-200">Incorrectas</p>
        </div>
        <div class="bg-gray-500/30 rounded-2xl p-4">
          <p class="text-3xl font-bold">{{ unansweredCount }}</p>
          <p class="text-sm mt-1 text-gray-300">Sin responder</p>
        </div>
      </div>

      <div class="bg-white/20 rounded-2xl p-6">
        <p class="text-white/70 text-sm mb-1">Puntuación (cada 3 errores descuestan 1 acierto)</p>
        <p class="text-6xl font-extrabold" :class="scoreColor">{{ scoreFormatted }}</p>
        <p class="text-white/60 text-xs mt-2">sobre {{ totalItems }} puntos máximos</p>
      </div>
    </template>
  </ActivityFinished>

  <template v-else>
    <!-- Badge de categorías débiles (solo en modo adaptativo) -->
    <div v-if="adaptiveWeakCategories.length" class="flex flex-wrap gap-2 justify-center mb-4 px-4">
      <span class="text-xs text-slate-400 self-center">Practicando:</span>
      <span v-for="cat in adaptiveWeakCategories" :key="cat.category"
        :class="['px-2.5 py-1 rounded-full text-xs font-medium', errorRateBadgeClass(cat.errorRate)]">
        {{ formatCategoryLabel(cat.category) }}
        <span class="opacity-60 ml-1">{{ Math.round(cat.errorRate * 100) }}% errores</span>
      </span>
    </div>

    <QuizQuestion :question="currentItem" :current-index="currentIndex" :total-items="totalItems"
      :selected-answer="selectedAnswer" :answered="answered" :is-last-item="isLastItem" @select="selectAnswer"
      @next="handleNext" />
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useActivitySession } from '@/composables/useActivitySession'
import { useQuizStats } from '@/composables/useQuizStats'
import { useQuizReward } from '@/composables/useQuizReward'
import { useCategoryStats } from '@/composables/useCategoryStats'
import {
  pickRandomIds,
  filterByIds,
  hasPdfInStorage,
  loadPdfQuestionsFromStorage,
  errorRateBadgeClass,
  formatCategoryLabel,
} from '@/composables/useAdaptiveSelection'
import api from '@/api/axios'
import ActivityLoading from './ActivityLoading.vue'
import ActivityFinished from './ActivityFinished.vue'
import QuizQuestion from './QuizQuestion.vue'

const route = useRoute()

// ─── Construcción de la URL para el modo estático / PDF cloud ────────────────
const _pdfUrls = route.query.pdfIds
  ? route.query.pdfIds.split(',').map(id => `/api/pdfs/${id}/quiz`)
  : route.query.pdfId
    ? [`/api/pdfs/${route.query.pdfId}/quiz`]
    : []
if (route.query.includePredefined === 'true') {
  _pdfUrls.push('/quizQuestions.json')
}
const quizUrl = _pdfUrls.length > 0 ? _pdfUrls : '/quizQuestions.json'

// ─── Sesión genérica ──────────────────────────────────────────────────────────
const {
  loading, finished, currentIndex, currentItem, totalItems, isLastItem,
  load, loadDirect, next, restart,
} = useActivitySession(quizUrl)

// ─── Estado específico del Quiz ───────────────────────────────────────────────
const selectedAnswer = ref(null)
const answered = ref(false)
const results = ref([])

// Categorías débiles recibidas del endpoint adaptativo (para el badge)
const adaptiveWeakCategories = ref([])

// ─── Carga inicial según el modo detectado ────────────────────────────────────
onMounted(async () => {
  const isAdaptive = route.query.adaptive === 'true'
  const singlePdfId = route.query.pdfId && !route.query.pdfIds ? route.query.pdfId : null

  if (isAdaptive) {
    await loadAdaptiveMode()
  } else if (singlePdfId && hasPdfInStorage(singlePdfId)) {
    await loadPdfLocalMode(singlePdfId)
  } else {
    await load()
  }

  results.value = new Array(totalItems.value).fill(null)
})

// Modo adaptativo: llama al endpoint, selecciona 15 preguntas aleatorias
async function loadAdaptiveMode() {
  try {
    const res = await api.get('/games/adaptive-quiz')
    if (res.status === 204 || !res.data?.questions?.length) {
      await load()
      return
    }
    const { questions, weakCategories } = res.data
    adaptiveWeakCategories.value = weakCategories ?? []
    const ids = pickRandomIds(questions, 15)
    await loadDirect(filterByIds(questions, ids))
  } catch {
    await load()
  }
}

// Modo PDF local: usa las preguntas del localStorage y los IDs activos guardados
async function loadPdfLocalMode(pdfId) {
  const stored = loadPdfQuestionsFromStorage(pdfId)
  if (!stored) {
    await load()
    return
  }
  const activeItems = filterByIds(stored.questions, stored.activeIds)
  await loadDirect(activeItems)
}

// ─── Estadísticas ─────────────────────────────────────────────────────────────
const { correctCount, wrongCount, unansweredCount, scoreFormatted, scoreColor } =
  useQuizStats(results, totalItems)

const score = computed(() => Math.max(0, correctCount.value - wrongCount.value / 3))

// ─── Recompensa ───────────────────────────────────────────────────────────────
const { earnedReward, rankLabel, rankColor, grantQuizReward } = useQuizReward()

// ─── Estadísticas por categoría ───────────────────────────────────────────────
const { trackAnswer, submitSession, resetSession } = useCategoryStats()

// ─── Acciones ─────────────────────────────────────────────────────────────────
function selectAnswer(idx) {
  if (answered.value) return
  selectedAnswer.value = idx
  answered.value = true
  const isCorrect = idx === currentItem.value.correct
  results.value[currentIndex.value] = isCorrect
  trackAnswer(currentItem.value.category, isCorrect, currentItem.value.id)
}

async function handleNext() {
  if (isLastItem.value) {
    await submitSession()
    await grantQuizReward(score.value, totalItems.value)
  }
  next(() => {
    selectedAnswer.value = null
    answered.value = false
  })
}

function handleRestart() {
  resetSession()
  adaptiveWeakCategories.value = []
  restart(() => {
    selectedAnswer.value = null
    answered.value = false
    results.value = new Array(totalItems.value).fill(null)
  })
}
</script>