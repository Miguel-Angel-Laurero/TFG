<template>
  <div class="w-full">
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
        <button class="adaptive-btn" :class="{ 'adaptive-btn--locked': !canUseAdaptive }" @click="handleAdaptiveClick"
          :disabled="!canUseAdaptive"
          aria-label="Empezar modo refuerzo con preguntas según tus errores recientes">
          <span class="adaptive-top">
            <span class="adaptive-badge">
              <i :class="canUseAdaptive ? 'pi pi-bullseye' : 'pi pi-clock'"></i>
              {{ canUseAdaptive ? 'Adaptativo' : 'Recarga' }}
            </span>
            <span class="adaptive-arrow">
              <span aria-hidden="true">→</span>
            </span>
          </span>

          <h2 class="adaptive-title">
            {{ canUseAdaptive ? 'Modo refuerzo' : 'Refuerzo en recarga' }}
          </h2>

          <p class="adaptive-copy">
            {{ canUseAdaptive
              ? 'Preguntas elegidas según tus errores recientes.'
              : 'Juega 3 partidas normales para volver a usarlo.' }}
          </p>

          <div v-if="!canUseAdaptive" class="adaptive-recharge">
            <div class="adaptive-recharge-row">
              <span>Recarga: {{ adaptiveRechargeLabel }}</span>
              <span>{{ adaptiveRechargePercent }}%</span>
            </div>
            <div class="adaptive-recharge-track">
              <div class="adaptive-recharge-fill" :style="{ width: `${adaptiveRechargePercent}%` }" />
            </div>
          </div>

          <div class="adaptive-foot">
            <span class="adaptive-dot"></span>
            <span>
              {{ canUseAdaptive ? 'No cambia tus partidas normales' : 'El modo normal sigue usando preguntas aleatorias' }}
            </span>
          </div>
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
  </div>
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
const { finishGame } = useGameProgress()

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
const { correctCount, wrongCount, unansweredCount, scoreFormatted, scoreColor, score } =
  useQuizStats(results, totalItems)

// Historial y desbloqueo adaptativo
const { history: quizHistory, canUseAdaptive, remainingGames, gamesSinceLastAdaptive, historyLoading, loadHistory, markAdaptiveUsed, timeAgo } = useAdaptiveHistory('Quiz')

const adaptiveRechargeGames = computed(() => {
  if (historyLoading.value) return 0
  return Math.min(3, Math.max(0, gamesSinceLastAdaptive.value ?? 0))
})
const adaptiveRechargeLabel = computed(() => historyLoading.value
  ? '.../3 partidas normales'
  : `${adaptiveRechargeGames.value}/3 partidas normales`)
const adaptiveRechargePercent = computed(() => Math.min(100, Math.round((adaptiveRechargeGames.value / 3) * 100)))

watch(finished, (v) => { if (v) { loadHistory(); finishGame(score.value) } })

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

<style scoped>
.adaptive-btn {
  position: relative;
  width: 100%;
  min-height: 150px;
  border: 0;
  border-radius: 18px;
  padding: 18px 18px 16px;
  cursor: pointer;
  text-align: left;
  color: white;
  background:
    radial-gradient(circle at 85% 18%, rgba(125, 249, 203, .26), transparent 22%),
    linear-gradient(145deg, #4f46e5, #312eaa);
  box-shadow: 0 18px 42px rgba(49, 46, 170, .34);
  transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
  overflow: hidden;
}

.adaptive-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 24px 52px rgba(49, 46, 170, .45);
  filter: brightness(1.04);
}

.adaptive-btn:active {
  transform: translateY(0);
}

.adaptive-btn--locked {
  cursor: not-allowed;
  background:
    radial-gradient(circle at 85% 18%, rgba(148, 163, 184, .16), transparent 22%),
    linear-gradient(145deg, #4338ca, #1e1b4b);
  opacity: .78;
}

.adaptive-btn--locked:hover {
  transform: none;
  box-shadow: 0 18px 42px rgba(49, 46, 170, .34);
  filter: none;
}

.adaptive-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 13px;
}

.adaptive-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 9px;
  border-radius: 999px;
  background: rgba(255, 255, 255, .13);
  border: 1px solid rgba(255, 255, 255, .16);
  color: #dbeafe;
  font-size: 10px;
  font-weight: 900;
  letter-spacing: .12em;
  text-transform: uppercase;
}

.adaptive-badge i {
  color: #fda4af;
  font-size: 10px;
}

.adaptive-arrow {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background: rgba(255, 255, 255, .15);
  font-size: 18px;
  font-weight: 900;
}

.adaptive-title {
  margin: 0;
  font-size: 22px;
  line-height: 1.05;
  font-weight: 950;
  letter-spacing: -.03em;
}

.adaptive-copy {
  margin: 10px 0 0;
  max-width: 190px;
  font-size: 12.5px;
  line-height: 1.35;
  color: rgba(255, 255, 255, .78);
  font-weight: 650;
}

.adaptive-foot {
  margin-top: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #bbf7d0;
  font-size: 12px;
  font-weight: 850;
}

.adaptive-dot {
  width: 7px;
  height: 7px;
  border-radius: 999px;
  background: #86efac;
  box-shadow: 0 0 14px #86efac;
  flex: 0 0 auto;
}

.adaptive-recharge {
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.adaptive-recharge-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: rgba(255, 255, 255, .8);
  font-size: 12px;
  font-weight: 900;
}

.adaptive-recharge-track {
  width: 100%;
  height: 8px;
  overflow: hidden;
  border-radius: 999px;
  background: rgba(255, 255, 255, .15);
}

.adaptive-recharge-fill {
  height: 100%;
  border-radius: 999px;
  background: #86efac;
  transition: width .5s ease;
}
</style>
