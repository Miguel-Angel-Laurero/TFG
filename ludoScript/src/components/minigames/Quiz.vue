<template>
  <Loading v-if="loadingManual" />

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

const route = useRoute()
const router = useRouter()

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
} = controller

// Estadísticas de UI
const { correctCount, wrongCount, unansweredCount, scoreFormatted, scoreColor } =
  useQuizStats(results, totalItems)

const score = computed(() => Math.max(0, correctCount.value - wrongCount.value / 3))

// Inicialización: respetamos el timer de carga mínimo
onMounted(async () => {
  await withMinTime(async () => {
    await initFromRoute(route)
    initResults(totalItems.value)
  })
})
</script>