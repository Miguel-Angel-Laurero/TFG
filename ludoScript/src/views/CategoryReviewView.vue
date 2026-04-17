<template>
  <div class="min-h-screen flex flex-col bg-gray-950 text-white">
    <header>
      <Header />
    </header>

    <main class="flex-grow max-w-3xl mx-auto w-full px-4 sm:px-6 py-8">

      <!-- Breadcrumb / back (Nielsen #3: user control and freedom) -->
      <button
        class="flex items-center gap-2 text-indigo-400 hover:text-indigo-200 transition-colors mb-6 text-sm"
        @click="$router.back()"
        aria-label="Volver a inicio"
      >
        <span aria-hidden="true">&larr;</span> Volver
      </button>

      <!-- Category header -->
      <div class="mb-8">
        <div class="flex items-center gap-3 mb-1">
          <span
            class="w-4 h-4 rounded-sm shrink-0"
            :style="{ backgroundColor: categoryColor }"
            aria-hidden="true"
          ></span>
          <h1 class="text-3xl font-righteous">{{ categoryLabel }}</h1>
        </div>
        <p class="text-gray-400 text-sm">
          Repasa las preguntas que fallaste en tu ultima sesion y entiende por que la respuesta correcta es la que es.
        </p>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="flex justify-center py-16">
        <span class="text-gray-500 animate-pulse">Cargando preguntas...</span>
      </div>

      <!-- No errors (Nielsen #1: visibility of system status) -->
      <div
        v-else-if="failedQuestions.length === 0"
        class="flex flex-col items-center gap-4 py-20 text-center"
      >
        <span class="text-5xl" aria-hidden="true">&#127881;</span>
        <p class="text-xl font-semibold text-emerald-400">Sin errores en esta categoria</p>
        <p class="text-gray-400 text-sm max-w-xs">
          No cometiste ningun fallo en <strong>{{ categoryLabel }}</strong> durante tu ultima sesion.
          Sigue practicando para mantener el nivel.
        </p>
        <button
          class="mt-4 px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 transition-colors text-sm font-semibold"
          @click="$router.back()"
        >
          Volver al inicio
        </button>
      </div>

      <!-- Failed questions list -->
      <ol v-else class="flex flex-col gap-6" aria-label="Preguntas falladas">
        <li
          v-for="(q, i) in failedQuestions"
          :key="q.id"
          class="rounded-xl border border-indigo-900 bg-gray-900/80 p-6"
        >
          <!-- Question number + text -->
          <p class="text-xs text-gray-500 mb-2 uppercase tracking-wider">Pregunta {{ i + 1 }}</p>
          <p class="font-semibold text-base mb-4 leading-relaxed">{{ q.question }}</p>

          <!-- Options: highlight correct in green, others neutral -->
          <ul class="flex flex-col gap-2 mb-5">
            <li
              v-for="(opt, idx) in q.options"
              :key="idx"
              class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm"
              :class="idx === q.correct
                ? 'bg-emerald-900/60 border border-emerald-600 text-emerald-200'
                : 'bg-gray-800/50 text-gray-400'"
            >
              <span
                class="shrink-0 text-xs font-bold"
                :class="idx === q.correct ? 'text-emerald-400' : 'text-gray-600'"
                aria-hidden="true"
              >{{ idx === q.correct ? '&#10003;' : String.fromCharCode(65 + idx) }}</span>
              {{ opt }}
            </li>
          </ul>

          <!-- Explanation (Nielsen #10: help and documentation) -->
          <div class="flex gap-3 bg-indigo-950/60 border border-indigo-800 rounded-lg px-4 py-3">
            <span class="text-indigo-400 shrink-0 mt-0.5" aria-hidden="true">&#128161;</span>
            <p class="text-sm text-indigo-100 leading-relaxed">{{ q.explanation }}</p>
          </div>
        </li>
      </ol>

    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import Header from '@/components/shared/Header.vue'
import Footer from '@/components/shared/Footer.vue'
import { getQuizCategoryLabel } from '@/utils/quizCategories'

const route = useRoute()
const categoryKey = computed(() => route.query.category ?? '')

const LS_LAST_SESSION = 'ludoscript_lastSession'

function masteryColor(correct, total) {
  if (total === 0) return '#374151'
  const ratio = correct / total
  if (ratio >= 0.8) return '#22c55e'
  if (ratio >= 0.6) return '#eab308'
  if (ratio >= 0.4) return '#f97316'
  return '#ef4444'
}

const categoryLabel = computed(() => getQuizCategoryLabel(categoryKey.value))

const loading = ref(true)
const allQuestions = ref([])

// Failed IDs from the last session for this category
const failedIds = computed(() => {
  try {
    const session = JSON.parse(localStorage.getItem(LS_LAST_SESSION) || 'null')
    return session?.stats?.[categoryKey.value]?.failedIds ?? []
  } catch (_) { return [] }
})

const categoryStats = computed(() => {
  try {
    const session = JSON.parse(localStorage.getItem(LS_LAST_SESSION) || 'null')
    return session?.stats?.[categoryKey.value] ?? { correct: 0, total: 0 }
  } catch (_) { return { correct: 0, total: 0 } }
})

const categoryColor = computed(() =>
  masteryColor(categoryStats.value.correct, categoryStats.value.total)
)

const failedQuestions = computed(() => {
  const ids = new Set(failedIds.value)
  return allQuestions.value.filter(
    q => q.category === categoryKey.value && ids.has(q.id)
  )
})

onMounted(async () => {
  try {
    const res = await fetch('/quizQuestions.json')
    allQuestions.value = await res.json()
    // Bug 2 fix: si la sesión vino de un PDF, añadir sus preguntas al banco
    const session = JSON.parse(localStorage.getItem(LS_LAST_SESSION) || 'null')
    if (session?.pdfId) {
      try {
        const raw = localStorage.getItem(`ludoscript_pdf_questions_${session.pdfId}`)
        const stored = JSON.parse(raw || 'null')
        if (stored?.questions?.length) {
          allQuestions.value = [...allQuestions.value, ...stored.questions]
        }
      } catch { /* ignorar si el storage falla */ }
    }
  } catch (err) {
    console.error('[CategoryReview] Error cargando preguntas:', err)
  } finally {
    loading.value = false
  }
})
</script>
