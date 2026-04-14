<template>
  <div class="flex flex-col gap-4">

    <!-- Skeleton de carga -->
    <template v-if="isLoading">
      <div v-for="n in 2" :key="n"
        class="animate-pulse h-28 rounded-2xl bg-slate-800/50 border border-slate-700/30 backdrop-blur-md">
        <div class="flex items-center gap-6 px-7 py-6 h-full">
          <div class="w-10 h-10 rounded-full bg-slate-700/60 shrink-0"></div>
          <div class="flex-1 flex flex-col gap-2.5">
            <div class="h-4 w-28 rounded-md bg-slate-700/60"></div>
            <div class="h-3 w-44 rounded-md bg-slate-700/40"></div>
          </div>
          <div class="w-24 h-9 rounded-xl bg-slate-700/60 shrink-0"></div>
        </div>
      </div>
    </template>

    <!-- Tarjetas de juego con Glassmorphism -->
    <template v-else>
      <div v-for="minigame in minigames" :key="minigame.id" class="group relative flex items-center gap-6 px-7 py-6 rounded-2xl
               bg-slate-800/50 backdrop-blur-md border border-slate-700/50
               cursor-pointer transition-all duration-300
               hover:-translate-y-1 hover:border-indigo-500/60
               hover:shadow-[0_8px_32px_rgba(99,102,241,0.18)]" @click="goToGame(minigame.name)">
        <!-- Icono con brillo en hover -->
        <span class="text-4xl select-none transition-all duration-300
                 group-hover:brightness-125 group-hover:scale-110 shrink-0">
          {{ gameIcon(minigame.name) }}
        </span>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <p class="text-xl font-bold bg-clip-text text-transparent
                    bg-gradient-to-r from-white to-slate-400">
            {{ minigame.name }}
          </p>
          <p class="text-sm text-slate-400 mt-0.5">{{ minigame.description }}</p>
        </div>

        <!-- Botón CTA -->
        <button class="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold
                 bg-indigo-600/80 hover:bg-indigo-500 text-white
                 transition-colors duration-200 pointer-events-none">
          {{ gameButtonText(minigame.name) }}
        </button>
      </div>

      <!-- Tarjeta multijugador (siempre visible, independiente del contenido) -->
      <div class="group relative flex items-center gap-6 px-7 py-6 rounded-2xl
               bg-slate-800/50 backdrop-blur-md border border-yellow-500/40
               cursor-pointer transition-all duration-300
               hover:-translate-y-1 hover:border-yellow-400/70
               hover:shadow-[0_8px_32px_rgba(234,179,8,0.18)]" @click="goToMultiplayer">
        <span class="text-4xl select-none transition-all duration-300
                 group-hover:brightness-125 group-hover:scale-110 shrink-0">
          🎮
        </span>
        <div class="flex-1 min-w-0">
          <p class="text-xl font-bold bg-clip-text text-transparent
                    bg-gradient-to-r from-yellow-300 to-amber-400">
            Multijugador
          </p>
          <p class="text-sm text-slate-400 mt-0.5">Compite con otros jugadores en tiempo real.</p>
        </div>
        <button class="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold
                 bg-yellow-500/80 hover:bg-yellow-400 text-gray-900
                 transition-colors duration-200 pointer-events-none">
          Jugar →
        </button>
      </div>

      <!-- Aviso: ningún contenido seleccionado -->
      <div v-if="noSelectionWarning"
        class="flex items-start gap-2 bg-amber-900/30 border border-amber-500/40 rounded-lg px-3 py-2">
        <span class="text-amber-400 mt-0.5">⚠️</span>
        <p class="text-xs text-amber-300">
          Selecciona al menos un contenido (predefinido o un PDF subido) antes de empezar.
        </p>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import api from '@/api/axios'

const props = defineProps({
  selectedFiles: {
    type: Array,
    default: () => []
  },
  pdfCount: {
    type: Number,
    default: 0
  },
  selectedPredefined: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const minigames = ref([])
const isLoading = ref(true)
const noSelectionWarning = ref(false)

const GAME_ICONS = { Quiz: '🧠', Flashcards: '🃏' }
const PDF_GAMES = ['Quiz', 'Flashcards']

function gameIcon(name) { return GAME_ICONS[name] ?? '🎮' }
function isPdfGame(name) { return PDF_GAMES.includes(name) }

function gameButtonText(name) {
  if (!isPdfGame(name)) return 'Empezar →'
  const hasPdfs = props.selectedFiles.length > 0
  const hasPredefined = props.selectedPredefined
  if (hasPdfs && hasPredefined) return 'Estudiar Mixto →'
  if (hasPdfs) return 'Estudiar mis PDFs →'
  if (hasPredefined) return 'Estudiar General →'
  return 'Selecciona contenido →'
}

onMounted(async () => {
  try {
    const res = await api.get("/activities")
    // Axios ya parsea el JSON, los datos están en res.data
    minigames.value = res.data 
  } catch (err) {
    console.error('Error al cargar los minijuegos', err)
  } finally {
    isLoading.value = false
  }
})

function goToMultiplayer() {
  router.push({ path: '/multiplayer/' })
}

function goToGame(name) {
  if (isPdfGame(name)) {
    const hasPdfs = props.selectedFiles.length > 0
    const hasPredefined = props.selectedPredefined
    if (!hasPdfs && !hasPredefined) {
      noSelectionWarning.value = true
      return
    }
    noSelectionWarning.value = false
    isLoading.value = true
    const query = { game: name }
    if (hasPdfs) {
      query.pdfIds = props.selectedFiles.join(',')
      if (hasPredefined) query.includePredefined = 'true'
    }
    router.push({ path: '/in-game-view/', query })
  } else {
    isLoading.value = true
    router.push({ path: '/in-game-view/', query: { game: name } })
  }
}
</script>