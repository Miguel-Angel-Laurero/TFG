<template>
  <main class="h-full w-full flex overflow-hidden" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">

    <!-- Left panel: PDF manager (ancho dinámico) -->
    <aside :style="{ width: panelWidth + 'px' }"
      class="shrink-0 border-r border-blue-900/40 px-4 py-6 overflow-y-auto flex flex-col">
      <HomePdfPanel v-model:selectedFiles="selectedFiles" v-model:pdfCount="pdfCount"
        v-model:selectedPredefined="selectedPredefined" />
    </aside>

    <!-- Resize handle -->
    <div class="w-1.5 shrink-0 cursor-col-resize hover:bg-indigo-500/40 active:bg-indigo-500/70 transition-colors"
      @mousedown.prevent="startDrag" />

    <!-- Center: minigames -->
    <section class="flex-1 flex justify-center overflow-y-auto py-8 min-w-0">
      <div class="w-full max-w-2xl px-8">
        <h2 class="text-2xl font-righteous text-white mb-4">Minijuegos</h2>

        <!-- Estado de Fuente (Nielsen: Visibilidad del estado) -->
        <div :class="[
          'mb-6 px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 border transition-colors',
          selectedFiles.length > 0 || selectedPredefined
            ? 'bg-indigo-900/40 border-indigo-500/50 text-indigo-300'
            : 'bg-amber-900/30 border-amber-500/40 text-amber-300'
        ]">
          <span>{{ modeIcon }}</span>
          <span>{{ modeLabel }}</span>
        </div>

        <GameGrid :selectedFiles="selectedFiles" :pdfCount="pdfCount" :selectedPredefined="selectedPredefined" />

        <!-- ═══════════════════════════════════════════════════════════
             SECCIÓN: PRÁCTICA ADAPTATIVA
             Los pesos se calculan en background al montar el componente.
             El botón solo dispara la llamada a Gemini.
        ════════════════════════════════════════════════════════════ -->
        <div class="mt-8 rounded-2xl bg-slate-800/60 border border-slate-700/50 p-5">
          <div class="flex items-center justify-between mb-3">
            <h3 class="text-white font-semibold text-sm flex items-center gap-2">
              <span>🎯</span> Práctica adaptativa
            </h3>
            <span v-if="statsLoading" class="text-slate-400 text-xs animate-pulse">Analizando…</span>
          </div>

          <!-- Categorías débiles calculadas en background -->
          <div v-if="weakCategories.length" class="flex flex-wrap gap-2 mb-4">
            <span v-for="cat in weakCategories.slice(0, 3)" :key="cat.category"
              :class="['px-2.5 py-1 rounded-full text-xs font-medium', errorRateBadgeClass(cat.errorRate)]">
              {{ formatCategoryLabel(cat.category) }}
              <span class="opacity-60 ml-1">{{ Math.round(cat.errorRate * 100) }}% errores</span>
            </span>
          </div>

          <!-- Sin datos suficientes -->
          <p v-else-if="!statsLoading" class="text-slate-400 text-xs mb-4 leading-relaxed">
            Completa más quizzes para desbloquear el análisis adaptativo
            <span class="text-slate-500">(mínimo 5 respuestas por tema)</span>.
          </p>

          <!-- Botón: solo dispara la navegación, Gemini se llama dentro del quiz -->
          <button @click="goToAdaptiveQuiz" :disabled="!hasEnoughData" :class="[
            'w-full py-2.5 rounded-xl text-sm font-semibold transition-all',
            hasEnoughData
              ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
              : 'bg-slate-700 text-slate-500 cursor-not-allowed'
          ]">
            Generar nuevas preguntas
          </button>
        </div>
      </div>
    </section>

    <!-- Right panel: category heat maps -->
    <aside class="w-80 shrink-0 border-l border-blue-900/40 px-6 py-8 overflow-y-auto">
      <CategoryHeatMap />
    </aside>
  </main>
</template>
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import GameGrid from '@/components/home/GameGrid.vue'
import CategoryHeatMap from '@/components/home/CategoryHeatMap.vue'
import HomePdfPanel from '@/components/home/HomePdfPanel.vue'
import { categoryStatsService } from '@/api/categoryStats.service'
import {
  calculateWeakCategories,
  errorRateBadgeClass,
  formatCategoryLabel,
} from '@/composables/useAdaptiveSelection'

const router = useRouter()

const selectedFiles = ref([])
const pdfCount = ref(0)
const selectedPredefined = ref(true)

// ─── Análisis adaptativo (se calcula en background al montar) ─────────────────
const statsLoading = ref(false)
const weakCategories = ref([])
const hasEnoughData = computed(() => weakCategories.value.length > 0)

onMounted(async () => {
  statsLoading.value = true
  try {
    const res = await categoryStatsService.getAll()
    weakCategories.value = calculateWeakCategories(res.data ?? [], 5)
  } catch {
    weakCategories.value = []
  } finally {
    statsLoading.value = false
  }
})

function goToAdaptiveQuiz() {
  if (!hasEnoughData.value) return
  router.push({ path: '/in-game-view/', query: { game: 'Quiz', adaptive: 'true' } })
}

const modeIcon = computed(() => {
  const hasPdfs = selectedFiles.value.length > 0
  if (!hasPdfs && !selectedPredefined.value) return '⚠️'
  if (hasPdfs && selectedPredefined.value) return '📂'
  if (hasPdfs) return '📂'
  return '📚'
})

const modeLabel = computed(() => {
  const hasPdfs = selectedFiles.value.length > 0
  const n = selectedFiles.value.length
  if (!hasPdfs && !selectedPredefined.value) return 'Selecciona al menos un contenido para jugar'
  if (hasPdfs && selectedPredefined.value) return `Modo: Mixto — Predefinido + ${n} archivo${n > 1 ? 's' : ''}`
  if (hasPdfs) return `Modo: Personalizado (${n} archivo${n > 1 ? 's' : ''} seleccionado${n > 1 ? 's' : ''})`
  return 'Modo: General — biblioteca del sistema'
})

// ─── Panel redimensionable ───────────────────────────────────────────────────
const MIN_WIDTH = 240
const MAX_WIDTH = 600
const panelWidth = ref(384)   // equivale a w-96 (96 × 4 = 384px)
let dragging = false

function startDrag() {
  dragging = true
}

function onDrag(e) {
  if (!dragging) return
  const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX))
  panelWidth.value = newWidth
}

function stopDrag() {
  dragging = false
}
</script>