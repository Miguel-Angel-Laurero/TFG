<template>
  <main class="relative h-full w-full overflow-hidden flex flex-col md:flex-row" @mousemove="onDrag" @mouseup="stopDrag"
    @mouseleave="stopDrag">
    <Tutorial class="w-full" />
    <div class="flex md:hidden border-b border-blue-900/40 bg-slate-950/95 px-4 py-3 z-20">
      <div class="relative flex w-full items-center justify-between">
        <button type="button"
          class="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-blue-900/50 bg-blue-900/30 text-indigo-200 transition-colors hover:bg-blue-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
          aria-label="Abrir menu de paneles" :aria-expanded="mobileMenuOpen" @click="mobileMenuOpen = !mobileMenuOpen">
          <i class="pi pi-bars text-base" />
        </button>

        <div v-show="mobileMenuOpen"
          class="absolute left-0 top-12 z-40 w-56 overflow-hidden rounded-lg border border-blue-900/50 bg-slate-950 shadow-xl shadow-black/30">
          <button type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 transition-colors hover:bg-indigo-500/15"
            @click="openMobilePanel('documents')">
            <i class="pi pi-cog text-indigo-300" />
            Configuración
          </button>
          <button type="button"
            class="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-200 transition-colors hover:bg-indigo-500/15"
            @click="openMobilePanel('stats')">
            <i class="pi pi-chart-line text-indigo-300" />
            Tu progreso
          </button>
        </div>
      </div>
    </div>

    <aside :style="isMobile ? {} : { width: panelWidth + 'px' }" :class="[
      'fixed inset-y-0 left-0 z-30 w-full border-b border-blue-900/40 bg-slate-950 px-4 py-4 overflow-y-auto flex flex-col transition-transform duration-300 ease-out md:static md:z-auto md:shrink-0 md:border-b-0 md:border-r md:bg-blue-900/20 md:py-6 md:transition-all md:max-h-full',
      openMobilePanelId === 'documents' ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
    ]" id="seccion-documentos">
      <button type="button"
        class="md:hidden absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-900/50 bg-blue-900/30 text-slate-200 transition-colors hover:bg-blue-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label="Ocultar configuracion" @click="closeMobilePanel">
        <i class="pi pi-times text-sm" />
      </button>
      <div class="flex items-center justify-between pr-12 md:pr-0 md:mb-4 mb-2">
        <h3 class="text-indigo-300 text-sm font-bold uppercase tracking-wider">Configuración</h3>
        <span class="md:hidden text-xs text-slate-500">Desliza para ver más</span>
      </div>

      <HomePdfPanel v-model:selectedFiles="selectedFiles" v-model:pdfCount="pdfCount"
        v-model:selectedPredefined="selectedPredefined" />
    </aside>
    <div
      class="hidden md:block w-1.5 shrink-0 cursor-col-resize hover:bg-indigo-500/40 active:bg-indigo-500/70 transition-colors"
      @mousedown.prevent="startDrag" />

    <section
      class="flex-1 flex flex-col overflow-y-auto items-center py-4 md:py-8 min-w-0 bg-[radial-gradient(circle_at_top,#1e1b4b_0%,#0f172a_42%,#020617_100%)] md:bg-slate-900/20"
      id="seccion-juegos">
      <div class="w-full max-w-[430px] md:max-w-2xl px-3.5 md:px-8">
        <h2 class="hidden md:block text-2xl md:text-3xl font-righteous text-white mb-6 text-center md:text-left">Modos
          de estudio</h2>

        <GameGrid :selectedFiles="selectedFiles" :pdfCount="pdfCount" :selectedPredefined="selectedPredefined"
          @view-progress="showProgressPanel" />
      </div>
    </section>

    <aside :class="[
      'fixed inset-y-0 right-0 z-30 w-full shrink-0 border-t border-blue-900/40 px-5 py-6 overflow-y-auto bg-slate-950 shadow-inner transition-transform duration-300 ease-out md:static md:z-auto md:w-80 md:border-t-0 md:border-l md:bg-blue-900/20 md:translate-x-0',
      openMobilePanelId === 'stats' ? 'translate-x-0' : 'translate-x-full md:translate-x-0',
    ]" id="seccion-estadisticas">
      <button type="button"
        class="md:hidden absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-900/50 bg-blue-900/30 text-slate-200 transition-colors hover:bg-blue-900/50 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-400"
        aria-label="Ocultar progreso" @click="closeMobilePanel">
        <i class="pi pi-times text-sm" />
      </button>
      <div class="max-w-2xl mx-auto pr-12 md:w-full md:pr-0">
        <h3 class="text-white mb-5 text-center md:text-left text-base font-righteous flex items-center gap-2">
          <span class="text-indigo-400">📈</span> Tu Progreso
        </h3>
        <ProgressPanel :selectedFiles="selectedFiles" :selectedPredefined="selectedPredefined" />
        <div class="h-10 md:hidden"></div>
      </div>
    </aside>
  </main>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import GameGrid from '@/components/home/GameGrid.vue'
import ProgressPanel from '@/components/home/ProgressPanel.vue'
import HomePdfPanel from '@/components/home/HomePdfPanel.vue'
import Tutorial from '../tutorial/Tutorial.vue'
import { useTutorialStore } from '@/stores/tutorial.store'
import { useAuthStore } from '@/stores/auth.store' // Faltaba esta importación

const tutorial = useTutorialStore()
const auth = useAuthStore() // Faltaba definir la constante auth


onMounted(async () => {
  try {
    // 1. Si no hay usuario, lo traemos (esto disparará el tutorial si lo configuraste en el store)
    if (!auth.user) {
      await auth.fetchMe()
    }

    // 2. Si el usuario ya existe (ej: volviste de otra pestaña), lo activamos manualmente
    if (auth.userData) {
      console.log("Estado de first_login en BBDD:", auth.userData.first_login)
      tutorial.initTutorial(auth.userData.first_login)
    }
  } catch (error) {
    console.error("Error al inicializar tutorial en Home:", error)
  }
})

const selectedFiles = ref([])
const pdfCount = ref(0)
const selectedPredefined = ref(true)
const mobileMenuOpen = ref(false)
const openMobilePanelId = ref(null)

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

function openMobilePanel(panelId) {
  openMobilePanelId.value = panelId
  mobileMenuOpen.value = false
}

function closeMobilePanel() {
  openMobilePanelId.value = null
}

function showProgressPanel() {
  mobileMenuOpen.value = false

  if (isMobile.value) {
    openMobilePanelId.value = 'stats'
    return
  }

  document.getElementById('seccion-estadisticas')?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest',
    inline: 'end',
  })
}


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
