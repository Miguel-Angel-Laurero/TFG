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
      </div>
    </section>

    <!-- Right panel: category heat maps -->
    <aside class="w-80 shrink-0 border-l border-blue-900/40 px-6 py-8 overflow-y-auto">
      <CategoryHeatMap />
    </aside>
  </main>
</template>
<script setup>
import { ref, computed } from 'vue'
import GameGrid from '@/components/home/GameGrid.vue'
import CategoryHeatMap from '@/components/home/CategoryHeatMap.vue'
import HomePdfPanel from '@/components/home/HomePdfPanel.vue'

const selectedFiles = ref([])
const pdfCount = ref(0)
const selectedPredefined = ref(true)

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