<template>
  <ActivityLoading v-if="loading" />

  <ActivityFinished
    v-else-if="finished"
    title="Resultado final"
    restart-label="Volver a intentarlo"
    @restart="handleRestart"
  >
    <!-- Slot con el bloque de puntuación, específico del Quiz -->
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
import ActivityLoading        from './ActivityLoading.vue'
import ActivityFinished       from './ActivityFinished.vue'
import QuizQuestion           from './QuizQuestion.vue'

// ─── Sesión genérica ─────────────────────────────────────────────────────────
const {
  loading, finished, currentIndex, currentItem, totalItems, isLastItem,
  load, next, restart,
} = useActivitySession('/quizQuestions.json')

// ─── Estado específico del Quiz ───────────────────────────────────────────────
const selectedAnswer = ref(null)   // índice (0-3) elegido por el usuario
const answered       = ref(false)  // bloquea opciones tras el primer click
// null = sin responder | true = correcta | false = incorrecta
const results        = ref([])

// Inicializar results cuando se carguen las preguntas
const stopWatch = computed(() => {
  if (!loading.value && results.value.length === 0) {
    results.value = new Array(totalItems.value).fill(null)
  }
})
// Forzar evaluación de la computed tras la carga
onMounted(async () => {
  await load()
  results.value = new Array(totalItems.value).fill(null)
})

// ─── Estadísticas ─────────────────────────────────────────────────────────────
const { correctCount, wrongCount, unansweredCount, scoreFormatted, scoreColor } =
  useQuizStats(results, totalItems)

// ─── Acciones ─────────────────────────────────────────────────────────────────
function selectAnswer(idx) {
  if (answered.value) return
  selectedAnswer.value              = idx
  answered.value                    = true
  results.value[currentIndex.value] = idx === currentItem.value.correct
}

function handleNext() {
  next(() => {
    // onReset: limpiar estado local antes de avanzar al siguiente item
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
