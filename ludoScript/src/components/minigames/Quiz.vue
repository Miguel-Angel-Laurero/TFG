<template>
  <ActivityLoading v-if="loading" />

  <ActivityFinished
    v-else-if="finished"
    title="Resultado final"
    restart-label="Volver a intentarlo"
    :earned-reward="earnedReward"
    :rank-label="rankLabel"
    :rank-color="rankColor"
    @restart="handleRestart"
  >
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

  <QuizQuestion
    v-else
    :question="currentItem"
    :current-index="currentIndex"
    :total-items="totalItems"
    :selected-answer="selectedAnswer"
    :answered="answered"
    :is-last-item="isLastItem"
    @select="selectAnswer"
    @next="handleNext"
  />
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useActivitySession } from '@/composables/useActivitySession'
import { useQuizStats }       from '@/composables/useQuizStats'
import { useQuizReward }      from '@/composables/useQuizReward'
import ActivityLoading        from './ActivityLoading.vue'
import ActivityFinished       from './ActivityFinished.vue'
import QuizQuestion           from './QuizQuestion.vue'

// ─── Sesión genérica ──────────────────────────────────────────────────────────
const {
  loading, finished, currentIndex, currentItem, totalItems, isLastItem,
  load, next, restart,
} = useActivitySession('/quizQuestions.json')

// ─── Estado específico del Quiz ───────────────────────────────────────────────
const selectedAnswer = ref(null)
const answered       = ref(false)
const results        = ref([])

onMounted(async () => {
  await load()
  results.value = new Array(totalItems.value).fill(null)
})

// ─── Estadísticas ─────────────────────────────────────────────────────────────
const { correctCount, wrongCount, unansweredCount, scoreFormatted, scoreColor } =
  useQuizStats(results, totalItems)

// Puntuación real (con penalización) para calcular el rango
const score = computed(() => {
  const raw = correctCount.value - wrongCount.value / 3
  return Math.max(0, raw)
})

// ─── Recompensa ───────────────────────────────────────────────────────────────
const { earnedReward, rankLabel, rankColor, grantQuizReward } = useQuizReward()

// ─── Acciones ─────────────────────────────────────────────────────────────────
function selectAnswer(idx) {
  if (answered.value) return
  selectedAnswer.value              = idx
  answered.value                    = true
  results.value[currentIndex.value] = idx === currentItem.value.correct
}

async function handleNext() {
  // Si es la última pregunta, otorgamos la recompensa antes de mostrar resultados
  if (isLastItem.value) {
    await grantQuizReward(score.value, totalItems.value)
  }
  next(() => {
    selectedAnswer.value = null
    answered.value       = false
  })
}

function handleRestart() {
  restart(() => {
    selectedAnswer.value = null
    answered.value       = false
    results.value        = new Array(totalItems.value).fill(null)
  })
}
</script>