<template>
  <Loading v-if="loadingManual" />

  <!-- Calculando puntuación tras la última respuesta -->
  <div v-else-if="calculating"
    class="fixed inset-0 z-50 flex flex-col items-center justify-center gap-6 bg-slate-900/95">
    <ProgressSpinner style="width: 80px; height: 80px" strokeWidth="6" fill="transparent" animationDuration=".8s"
      aria-label="Calculando puntuación" />
    <p class="text-white/80 text-lg font-semibold tracking-wide animate-pulse">
      Calculando puntuación…
    </p>
  </div>

  <ActivityFinished v-else-if="finished" title="Resultado final" restart-label="Volver a intentarlo"
    :earned-reward="earnedReward" :rank-label="rankLabel" :rank-color="rankColor" :hero-score="scoreFormatted"
    @restart="handleRestart">
    <template #extra>
      <!-- Stats: cajas glassmorphism con colores intensos -->
      <div class="grid grid-cols-2 gap-3 text-white">
        <div class="bg-emerald-500/20 border border-emerald-400/25 rounded-2xl p-8 flex flex-col items-center gap-3">
          <p class="text-3xl font-black text-emerald-300 tracking-tight">{{ correctCount }}</p>
          <p class="text-[0.6rem] uppercase tracking-widest text-emerald-400/70">Correctas</p>
        </div>
        <div class="bg-red-500/20 border border-red-400/25 rounded-2xl p-8 flex flex-col items-center gap-3">
          <p class="text-3xl font-black text-red-300 tracking-tight">{{ wrongCount }}</p>
          <p class="text-[0.6rem] uppercase tracking-widest text-red-400/70">Incorrectas</p>
        </div>
        <!-- <div class="bg-white/[0.06] border border-white/[0.08] rounded-2xl p-4 flex flex-col items-center gap-1">
          <p class="text-3xl font-black text-white/50 tracking-tight">{{ unansweredCount }}</p>
          <p class="text-[0.6rem] uppercase tracking-widest text-white/25">Sin resp.</p>
        </div> -->
      </div>

      <!-- Botón adaptativo: visible siempre, desbloqueado tras 3 partidas desde el último uso -->
      <div class="flex flex-col gap-2">
        <!-- Progreso hacia el desbloqueo -->
        <div v-if="!canUseAdaptive" class="bg-white/10 rounded-xl px-4 py-3">
          <div class="flex items-center justify-between mb-2">
            <span class="text-white/70 text-xs font-medium">Desbloquear modo adaptativo</span>
            <span class="text-white font-bold text-sm">
              {{ historyLoading ? '…' : gamesSinceLastAdaptive }}<span class="text-white/50 font-normal">/3
                partidas</span>
            </span>
          </div>
          <div class="w-full bg-white/10 rounded-full h-2">
            <div class="bg-indigo-400 h-2 rounded-full transition-all duration-500"
              :style="{ width: historyLoading ? '0%' : `${Math.min(100, (gamesSinceLastAdaptive / 3) * 100)}%` }" />
          </div>
        </div>

        <button @click="handleAdaptiveClick" :disabled="!canUseAdaptive" :class="[
          'w-full py-3 px-8 rounded-xl font-bold transition-all',
          canUseAdaptive
            ? 'bg-indigo-800 hover:bg-indigo-500 text-white cursor-pointer'
            : 'bg-white/10 text-white/40 cursor-not-allowed'
        ]">
          🎯 Practicar categorías débiles
        </button>
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

    <!-- DEV ONLY: eliminar antes de la presentación -->
    <div class="fixed bottom-4 left-1/2 -translate-x-1/2 z-50">
      <button @click="devSkipToResults"
        class="flex items-center gap-2 bg-orange-500/90 hover:bg-orange-400 text-white text-xs font-mono font-bold px-4 py-2 rounded-full shadow-lg backdrop-blur border border-orange-300/30 transition-all">
        ⚡ DEV — Saltar a resultados
      </button>
    </div>
  </template>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useGameProgress } from '@/composables/useGameProgress'

// ─── Props de dificultad (pasados desde InGame.vue vía QuizIntro)
const props = defineProps({
  difficulty: { default: null },
  unlockedMap: { default: null },
})

import { useQuizLoader } from '@/composables/useQuizLoader'
import { useQuizController } from '@/composables/useQuizController'
import { useQuizStats } from '@/composables/useQuizStats'
import { useQuizReward } from '@/composables/useQuizReward'
import { useCategoryStats } from '@/composables/useCategoryStats'
import { errorRateBadgeClass, formatCategoryLabel } from '@/composables/useAdaptiveSelection'
import Loading from '../shared/Loading.vue'
import ActivityFinished from './ActivityFinished.vue'
import QuizQuestion from './QuizQuestion.vue'
import { useLoadingTimer } from '@/composables/useLoadingTimer'
import { useAdaptiveHistory } from '@/composables/useAdaptiveHistory'
import ProgressSpinner from 'primevue/progressspinner'

const route = useRoute()
const router = useRouter()
const { updateScore } = useGameProgress()

// Loading UI guard (mantener comportamiento anterior)
const loadingManual = ref(true)
const { withMinTime } = useLoadingTimer(loadingManual, 3000)

// Recompensas y tracking de categoría (inyecciones para los composables)
const { trackAnswer, submitSession, resetSession, setPdfSource } = useCategoryStats()
const { earnedReward, rankLabel, rankColor, grantQuizReward } = useQuizReward()

// Loader: encapsula modos de carga y expone funciones testables
const loader = useQuizLoader({ jsonUrl: '/quizQuestions.json', setPdfSource })
const {
  loading,
  finished,
  currentIndex,
  currentItem,
  totalItems,
  isLastItem,
  loadDirect,
  next,
  restart,
  loadError,
  adaptiveWeakCategories,
  loadStaticMode,
  loadPdfLocalMode,
  loadMixedMode,
  loadAdaptiveMode,
  initFromRoute,
} = loader

// Controller: acciones del quiz y lógica finalizable
const controller = useQuizController({
  currentItem,
  currentIndex,
  totalItems,
  isLastItem,
  next,
  restart,
  trackAnswer,
  submitSession,
  resetSession,
  grantQuizReward,
  rankLabelRef: rankLabel,
})

const {
  selectedAnswer,
  answered,
  results,
  initResults,
  selectAnswer,
  handleNext,
  handleRestart,
  goToAdaptiveQuizFromResults,
  weakCategoriesAfterQuiz,
  calculating,
} = controller

// Estadísticas de UI
const { correctCount, wrongCount, unansweredCount, scoreFormatted, scoreColor } =
  useQuizStats(results, totalItems)

const score = computed(() => Math.max(0, correctCount.value - wrongCount.value / 3))

// Historial y desbloqueo adaptativo
const { history: quizHistory, canUseAdaptive, remainingGames, gamesSinceLastAdaptive, historyLoading, loadHistory, markAdaptiveUsed, timeAgo } = useAdaptiveHistory('Quiz')

watch(finished, (v) => { if (v) { loadHistory(); updateScore(score.value) } })

function handleAdaptiveClick() {
  markAdaptiveUsed()
  goToAdaptiveQuizFromResults()
}

// Inicialización: respetamos el timer de carga mínimo
onMounted(async () => {
  await withMinTime(async () => {
    await initFromRoute(route)
    initResults(totalItems.value)
  })
})

// ─── DEV ONLY — eliminar antes de la presentación ────────────────────────────
async function devSkipToResults() {
  const total = totalItems.value
  if (!total) return
  // Simular una partida con ~60% de aciertos
  results.value = Array.from({ length: total }, (_, i) => i % 5 !== 0)
  currentIndex.value = total - 1
  selectedAnswer.value = 1
  answered.value = true
  await handleNext()
}
// ─────────────────────────────────────────────────────────────────────────────
</script>