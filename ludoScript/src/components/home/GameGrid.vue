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

          <!-- Tooltip sutil: PDFs disponibles pero ninguno seleccionado -->
          <p v-if="isPdfGame(minigame.name) && pdfCount > 0 && selectedFiles.length === 0"
            class="text-xs text-amber-400/80 mt-2 flex items-center gap-1.5">
            <span>💡</span>
            ¿Quieres usar tus PDFs? Selecciónalos a la izquierda.
          </p>
        </div>

        <!-- Botón CTA -->
        <button class="shrink-0 px-4 py-2.5 rounded-xl text-sm font-semibold
                 bg-indigo-600/80 hover:bg-indigo-500 text-white
                 transition-colors duration-200 pointer-events-none">
          {{ gameButtonText(minigame.name) }}
        </button>
      </div>
    </template>

  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const props = defineProps({
  selectedFiles: {
    type: Array,
    default: () => []
  },
  pdfCount: {
    type: Number,
    default: 0
  }
})

const router = useRouter()
const minigames = ref([])
const isLoading = ref(true)

const GAME_ICONS = { Quiz: '🧠', Flashcards: '🃏' }
const PDF_GAMES = ['Quiz', 'Flashcards']

function gameIcon(name) { return GAME_ICONS[name] ?? '🎮' }
function isPdfGame(name) { return PDF_GAMES.includes(name) }

function gameButtonText(name) {
  if (!isPdfGame(name)) return 'Empezar →'
  return props.selectedFiles.length > 0 ? 'Estudiar mis PDFs →' : 'Estudiar General →'
}

onMounted(async () => {
  try {
    const res = await fetch('/games.json')
    minigames.value = await res.json()
  } catch (err) {
    console.error('Error al cargar los minijuegos', err)
  } finally {
    isLoading.value = false
  }
})

function goToGame(name) {
  isLoading.value = true
  const query = { game: name }
  if (isPdfGame(name) && props.selectedFiles.length > 0) {
    query.pdfIds = props.selectedFiles.join(',')
  }
  router.push({ path: '/in-game-view/', query })
}
</script>