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

      <button v-if="weakCategoriesAfterQuiz.length" @click="goToAdaptiveQuizFromResults"
        class="w-full py-3 px-8 rounded-xl font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-all">
        🎯 Generar nuevas preguntas
      </button>
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

    <!-- Guard: error al cargar las preguntas del PDF -->
    <div v-if="loadError" class="flex flex-col items-center gap-4 p-10 text-center">
      <p class="text-slate-400 text-sm">No se pudieron cargar las preguntas del PDF.</p>
      <button @click="$router.push('/')"
        class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all">
        Volver al inicio
      </button>
    </div>

    <!-- Guard: items vacíos por cualquier otro fallo -->
    <div v-else-if="!currentItem" class="flex flex-col items-center gap-4 p-10 text-center">
      <p class="text-slate-400 text-sm">No se pudieron cargar las preguntas.</p>
      <button @click="$router.push('/')"
        class="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold transition-all">
        Volver al inicio
      </button>
    </div>

    <QuizQuestion v-else :question="currentItem" :current-index="currentIndex" :total-items="totalItems"
      :selected-answer="selectedAnswer" :answered="answered" :is-last-item="isLastItem" @select="selectAnswer"
      @next="handleNext" />
  </template>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

// ─── Props de dificultad (pasados desde InGame.vue vía QuizIntro) ─────────────
// difficulty:  1 | 2 | 3 | 'personalizado' | null  (null = sin filtro)
// unlockedMap: { [category]: unlockedDifficulty }   (solo con 'personalizado')
const props = defineProps({
  difficulty: { default: null },
  unlockedMap: { default: null },
})
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
  calculateWeakCategories,
} from '@/composables/useAdaptiveSelection'
import api from '@/api/axios'
import { categoryStatsService } from '@/api/categoryStats.service'
import { gameService } from '@/api/game.service'
import { getSessionSummary } from '@/composables/useSessionTracker'
import Loading from '../shared/Loading.vue'
import ActivityFinished from './ActivityFinished.vue'
import QuizQuestion from './QuizQuestion.vue'

const route = useRoute()

// ─── Sesión genérica ──────────────────────────────────────────────────────────
const {
  loading, finished, currentIndex, currentItem, totalItems, isLastItem,
  loadDirect, next, restart,
} = useActivitySession('/quizQuestions.json')

// ─── Estado específico del Quiz ───────────────────────────────────────────────
const selectedAnswer = ref(null)
const answered = ref(false)
const results = ref([])

// Categorías débiles recibidas del endpoint adaptativo (para el badge)
const adaptiveWeakCategories = ref([])

// Categorías débiles calculadas en cliente tras finalizar (para el botón en resultados)
const weakCategoriesAfterQuiz = ref([])

const router = useRouter()

// ─── Estado de error de carga ─────────────────────────────────────────────────
const loadError = ref(false)

// ─── Carga inicial según el modo detectado ────────────────────────────────────
onMounted(async () => {
  const isAdaptive = route.query.adaptive === 'true'
  const pdfIdsList = route.query.pdfIds?.split(',').filter(Boolean) ?? []
  const hasPdfQuery = pdfIdsList.length > 0 || !!route.query.pdfId

  if (isAdaptive) {
    await loadAdaptiveMode()
  } else if (hasPdfQuery) {
    const pdfId = pdfIdsList[0] ?? route.query.pdfId
    const includePredefined = route.query.includePredefined === 'true'
    if (!hasPdfInStorage(pdfId)) {
      loadError.value = true
      await loadDirect([])
    } else if (includePredefined) {
      await loadMixedMode(pdfId)
    } else {
      await loadPdfLocalMode(pdfId)
    }
  } else {
    await loadStaticMode()
  }

  results.value = new Array(totalItems.value).fill(null)
})

// Modo estático puro: 15 preguntas aleatorias del banco JS
async function loadStaticMode() {
  try {
    const res = await fetch('/quizQuestions.json')
    const allQ = await res.json()
    const ids = pickRandomIds(allQ, Math.min(15, allQ.length))
    await loadDirect(filterByIds(allQ, ids))
  } catch {
    loadError.value = true
    await loadDirect([])
  }
}

// Modo PDF solo: usa las preguntas del localStorage y los IDs activos guardados
async function loadPdfLocalMode(pdfId) {
  const stored = loadPdfQuestionsFromStorage(pdfId)
  if (!stored) {
    loadError.value = true
    await loadDirect([])
    return
  }
  setPdfSource(pdfId)
  const activeItems = filterByIds(stored.questions, stored.activeIds)
  await loadDirect(activeItems)
}

// Modo mixto: PDF (10 preguntas) + banco estático JS (5 preguntas) — Bug 1 fix
async function loadMixedMode(pdfId) {
  const stored = loadPdfQuestionsFromStorage(pdfId)
  if (!stored) {
    loadError.value = true
    await loadDirect([])
    return
  }
  setPdfSource(pdfId)
  const pdfItems = filterByIds(stored.questions, stored.activeIds).slice(0, 10)
  try {
    const res = await fetch('/quizQuestions.json')
    const staticQ = await res.json()
    const staticItems = filterByIds(staticQ, pickRandomIds(staticQ, 5))
    await loadDirect([...pdfItems, ...staticItems])
  } catch {
    await loadDirect(pdfItems)
  }
}

// Modo adaptativo: llama al endpoint, selecciona 15 preguntas aleatorias
async function loadAdaptiveMode() {
  try {
    const res = await api.get('/games/adaptive-quiz')
    if (res.status === 204 || !res.data?.questions?.length) {
      await loadStaticMode()
      return
    }
    const { questions, weakCategories } = res.data
    adaptiveWeakCategories.value = weakCategories ?? []
    const ids = pickRandomIds(questions, Math.min(15, questions.length))
    await loadDirect(filterByIds(questions, ids))
  } catch {
    await loadStaticMode()
  }
}

// ─── Estadísticas ─────────────────────────────────────────────────────────────
const { correctCount, wrongCount, unansweredCount, scoreFormatted, scoreColor } =
  useQuizStats(results, totalItems)

const score = computed(() => Math.max(0, correctCount.value - wrongCount.value / 3))

// ─── Recompensa ───────────────────────────────────────────────────────────────
const { earnedReward, rankLabel, rankColor, grantQuizReward } = useQuizReward()

// ─── Estadísticas por categoría ───────────────────────────────────────────────
const { trackAnswer, submitSession, resetSession, setPdfSource } = useCategoryStats()

// ─── Acciones ─────────────────────────────────────────────────────────────────
function selectAnswer(idx) {
  if (answered.value) return
  selectedAnswer.value = idx
  answered.value = true
  const isCorrect = idx === currentItem.value.correct
  results.value[currentIndex.value] = isCorrect
  trackAnswer(
    currentItem.value.category,
    isCorrect,
    currentItem.value.id,
    currentItem.value.difficulty ?? null,
  )
}

async function handleNext() {
  if (isLastItem.value) {
    // Capturar el tiempo de la sesión antes de que se pierda al navegar
    const summary = getSessionSummary()
    await submitSession()
    await grantQuizReward(score.value, totalItems.value)
    // Guardar partida en el backend con los resultados calculados en el cliente
    try {
      await gameService.createGame({
        gameName: 'Quiz',
        score: score.value,
        duration: summary?.elapsedMin ?? 0,
        result: rankLabel.value?.toLowerCase() ?? 'suspenso',
      })
    } catch (_) { /* no bloquear si falla la red */ }
    // Calcular categorías débiles para el botón de práctica adaptativa en resultados
    try {
      const res = await categoryStatsService.getAll()
      weakCategoriesAfterQuiz.value = calculateWeakCategories(res.data ?? [], 5)
    } catch (_) {
      weakCategoriesAfterQuiz.value = []
    }
  }
  next(() => {
    selectedAnswer.value = null
    answered.value = false
  })
}

function handleRestart() {
  loadError.value = false
  resetSession()
  weakCategoriesAfterQuiz.value = []
  adaptiveWeakCategories.value = []
  restart(() => {
    selectedAnswer.value = null
    answered.value = false
    results.value = new Array(totalItems.value).fill(null)
  })
}

function goToAdaptiveQuizFromResults() {
  router.push({ path: '/in-game-view/', query: { game: 'Quiz', adaptive: 'true' } })
}
</script>