<template>
  <main class="h-full w-full overflow-hidden flex flex-col md:flex-row bg-blue-950" @mousemove="onDrag" @mouseup="stopDrag" @mouseleave="stopDrag">
    <aside 
      :style="isMobile ? {} : { width: panelWidth + 'px' }"
      class=" w-full md:shrink-0 border-b md:border-b-0 md:border-r border-blue-900/40 
             px-4 py-4 md:py-6 overflow-y-auto flex flex-col transition-all
             max-h-[40vh] md:max-h-full" 
    >
      <div class="flex items-center justify-between md:mb-4 mb-2">
        <h3 class="text-indigo-300 text-sm font-bold uppercase tracking-wider">Configuración</h3>
        <span class="md:hidden text-xs text-slate-500">Desliza para ver más</span>
      </div>
      
      <HomePdfPanel 
        v-model:selectedFiles="selectedFiles" 
        v-model:pdfCount="pdfCount"
        v-model:selectedPredefined="selectedPredefined" 
      />
    </aside>

    <div 
      class="hidden md:block w-1.5 shrink-0 cursor-col-resize hover:bg-indigo-500/40 active:bg-indigo-500/70 transition-colors"
      @mousedown.prevent="startDrag" 
    />

    <section class="flex-1 grid grid-cols-[1fr_2fr] justify-center overflow-y-auto  items-center py-6 md:py-8 min-w-0 bg-slate-900/20">
    
      <Character class="max-w-sm m-auto ml-32 md:max-w-xs"/>
      <div class="w-full max-w-2xl m-auto px-4 md:px-8">
        <h2 class="text-2xl md:text-3xl font-righteous text-white mb-6 text-center md:text-left">Minijuegos</h2>

        <div :class="[
          'mb-8 px-5 py-3 rounded-2xl text-sm font-medium flex items-center gap-3 border transition-all shadow-lg',
          selectedFiles.length > 0 || selectedPredefined
            ? 'bg-indigo-500/10 border-indigo-500/40 text-indigo-200'
            : 'bg-amber-500/10 border-amber-500/40 text-amber-200'
        ]">
          <span class="text-xl">{{ modeIcon }}</span>
          <p class="leading-tight">{{ modeLabel }}</p>
        </div>

        <GameGrid :selectedFiles="selectedFiles" :pdfCount="pdfCount" :selectedPredefined="selectedPredefined" />
      </div>
    </section>

    <aside class="w-full md:w-80 shrink-0 border-t md:border-t-0 md:border-l border-blue-900/40 
                  px-6 py-8 overflow-y-auto bg-blue-900/20 shadow-inner">
      <div class="max-w-2xl mx-auto md:w-full">
        <h3 class="text-white mb-6 text-center md:text-left text-lg font-righteous flex items-center gap-2">
          <span class="text-indigo-400">📊</span> Estadísticas de Uso
        </h3>
        <CategoryHeatMap />
        <div class="h-10 md:hidden"></div>
      </div>
    </aside>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GameGrid from '@/components/home/GameGrid.vue'
import CategoryHeatMap from '@/components/home/CategoryHeatMap.vue'
import HomePdfPanel from '@/components/home/HomePdfPanel.vue'
import Character from '../profile/Character.vue'

const selectedFiles = ref([])
const pdfCount = ref(0)
const selectedPredefined = ref(true)

// Lógica para detectar si es móvil
const isMobile = ref(false)
const checkMobile = () => {
  isMobile.value = window.innerWidth < 768
}

onMounted(() => {
  checkMobile()
  window.addEventListener('resize', checkMobile)
})
onUnmounted(() => window.removeEventListener('resize', checkMobile))


const modeIcon = computed(() => {
  const hasPdfs = selectedFiles.value.length > 0
  if (!hasPdfs && !selectedPredefined.value) return '⚠️'
  return hasPdfs ? '📂' : '📚'
})

const modeLabel = computed(() => {
  const hasPdfs = selectedFiles.value.length > 0
  const n = selectedFiles.value.length
  if (!hasPdfs && !selectedPredefined.value) return 'Selecciona contenido'
  if (hasPdfs && selectedPredefined.value) return `Mixto (${n} PDF)`
  if (hasPdfs) return `Personalizado (${n})`
  return 'Modo General'
})

// ─── Panel redimensionable ───────────────────────────────────────────────────
const MIN_WIDTH = 240
const MAX_WIDTH = 600
const panelWidth = ref(300) 
let dragging = false

function startDrag() { if (!isMobile.value) dragging = true }
function onDrag(e) {
  if (!dragging || isMobile.value) return
  const newWidth = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, e.clientX))
  panelWidth.value = newWidth
}
function stopDrag() { dragging = false }
</script>