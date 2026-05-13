<template>
  <div class="flex flex-col gap-5">
    <header class="flex flex-col gap-2">
      <!-- <p class="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Modos de estudio</p> -->
      <h2 class="font-righteous text-2xl font-black leading-tight text-white sm:text-3xl">
        ¿Cómo quieres avanzar hoy?
      </h2>
      <p class="text-sm leading-relaxed text-indigo-100/80 sm:text-base">
        Elige según tu objetivo: practicar, repasar o competir.
      </p>
    </header>

    <template v-if="isLoading">
      <div class="animate-pulse min-h-[260px] rounded-3xl bg-slate-800/50 border border-yellow-500/25 backdrop-blur-md">
        <div class="flex h-full min-h-[260px] flex-col justify-between px-5 py-5 sm:px-7 sm:py-7">
          <div class="flex justify-between gap-4">
            <div class="h-8 w-44 rounded-full bg-slate-700/60"></div>
            <div class="h-5 w-20 rounded-md bg-slate-700/40"></div>
          </div>
          <div class="flex items-center gap-4">
            <div class="h-20 w-20 rounded-3xl bg-slate-700/60"></div>
            <div class="flex flex-1 flex-col gap-3">
              <div class="h-7 w-32 rounded-md bg-slate-700/60"></div>
              <div class="h-4 w-full max-w-72 rounded-md bg-slate-700/40"></div>
            </div>
          </div>
          <div class="h-14 rounded-2xl bg-slate-700/60"></div>
        </div>
      </div>
    </template>

    <template v-else>
      <div
        class="flex flex-col gap-3 rounded-2xl border border-indigo-400/20 bg-indigo-500/10 p-3 shadow-lg shadow-indigo-950/20 sm:flex-row sm:items-center sm:justify-between">
        <div class="flex min-w-0 items-center gap-3">
          <div
            class="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-500/20 text-xl ring-1 ring-indigo-300/20">
            {{ modeIcon }}
          </div>

          <div class="min-w-0">
            <h3 class="font-righteous text-base font-bold text-white">
              Todos los modos
            </h3>

            <span
              class="mt-1 inline-flex max-w-full items-center rounded-full border px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-wide truncate"
              :class="!props.selectedPredefined && props.selectedFiles.length === 0
                ? 'bg-amber-500/10 border-amber-500/25 text-amber-300'
                : 'bg-indigo-500/20 border-indigo-400/30 text-indigo-200'">
              <span class="truncate">{{ modeLabel }}</span>
            </span>
          </div>
        </div>

        <button type="button"
          class="inline-flex h-11 w-full items-center justify-center rounded-2xl bg-indigo-500 px-4 font-righteous text-sm font-bold text-white shadow-md shadow-indigo-950/30 transition hover:bg-indigo-400 active:scale-[0.98] sm:w-auto"
          @click="goToProgress">
          Ver progreso
        </button>
      </div>

      <div class="flex flex-col gap-3">
        <article v-for="mode in modes" :key="mode.name" role="button" tabindex="0"
          class="group relative grid cursor-pointer grid-cols-[auto_1fr_auto] items-center gap-3 rounded-3xl border px-4 py-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 focus:outline-none focus:ring-2 focus:ring-yellow-300/70 focus:ring-offset-2 focus:ring-offset-slate-950 sm:gap-4 sm:px-5 sm:py-5"
          :class="mode.cardClass" @click="mode.action" @keydown.enter.prevent="mode.action"
          @keydown.space.prevent="mode.action">
          <div
            class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/8 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 sm:h-[72px] sm:w-[72px]">
            <img :src="mode.image" alt="" class="h-11 w-11 object-contain sm:h-12 sm:w-12" />
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-righteous text-lg font-black leading-tight text-white sm:text-xl">{{ mode.name }}</h4>
              <span v-if="mode.badge" class="rounded-full px-2 py-0.5 text-[10px] font-black uppercase"
                :class="mode.badgeClass ?? 'bg-emerald-400/15 text-emerald-300'">
                {{ mode.badge }}
              </span>
            </div>
            <p class="mt-1 text-xs leading-snug text-indigo-100/75 sm:text-sm">{{ mode.description }}</p>
          </div>

          <div
            class="pointer-events-none inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/45 text-white ring-1 ring-white/10 transition-all duration-200 group-hover:translate-x-1 group-hover:bg-indigo-500/70 group-hover:ring-indigo-200/30"
            aria-hidden="true">
            <i class="pi pi-arrow-right text-base"></i>
          </div>
        </article>
      </div>

      <div v-if="noSelectionWarning"
        class="flex items-start gap-2 bg-amber-900/30 border border-amber-500/40 rounded-lg px-3 py-2">
        <span class="text-amber-400 mt-0.5">!</span>
        <p class="text-xs text-amber-300">
          Selecciona al menos un contenido (predefinido o un PDF subido) antes de empezar.
        </p>
      </div>
    </template>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IMAGES } from '@/utils/imgBucketStorage'

const props = defineProps({
  selectedFiles: {
    type: Array,
    default: () => [],
  },
  pdfCount: {
    type: Number,
    default: 0,
  },
  selectedPredefined: {
    type: Boolean,
    default: true,
  },
})

const emit = defineEmits(['view-progress'])

const router = useRouter()

const isLoading = ref(true)
const noSelectionWarning = ref(false)

const modeLabel = computed(() => {
  const hasPdfs = props.selectedFiles.length > 0
  const n = props.selectedFiles.length
  if (!hasPdfs && !props.selectedPredefined) return 'Selecciona contenido'
  if (hasPdfs && props.selectedPredefined) return `Mixto (${n} PDF)`
  if (hasPdfs) return `Personalizado (${n})`
  return 'Modo General'
})

const modeIcon = computed(() => {
  const hasPdfs = props.selectedFiles.length > 0
  if (!hasPdfs && !props.selectedPredefined) return '⚠️'
  return hasPdfs ? '📂' : '📚'
})

const modes = [
  {
    name: 'Quiz',
    description: 'Pon a prueba tu conocimiento del tema.',
    image: IMAGES.quiz,
    badge: 'Recomendado para ti',
    badgeClass: 'border border-yellow-400/35 bg-yellow-400/10 text-yellow-200',
    cardClass: 'border-yellow-400/40 bg-slate-900/70 hover:border-yellow-300/70 hover:shadow-[0_12px_34px_rgba(234,179,8,0.15)]',
    action: () => goToGame('Quiz'),
  },
  {
    name: 'FlashCards',
    description: 'Practica y repasa mediante tarjetas sobre el tema que prefieras.',
    image: IMAGES.cards,
    cardClass: 'border-slate-700/55 bg-slate-900/60 hover:border-indigo-400/55 hover:shadow-[0_12px_34px_rgba(99,102,241,0.14)]',
    action: () => goToGame('FlashCards'),
  },
  {
    name: 'Multijugador',
    description: 'Compite con otros jugadores en tiempo real.',
    image: IMAGES.multi,
    cardClass: 'border-slate-700/55 bg-slate-900/60 hover:border-yellow-400/55 hover:shadow-[0_12px_34px_rgba(234,179,8,0.14)]',
    action: () => goToMultiplayer(),
  },
]

function gameButtonText() {
  const hasPdfs = props.selectedFiles.length > 0
  const hasPredefined = props.selectedPredefined
  if (hasPdfs && hasPredefined) return 'Estudiar Mixto ->'
  if (hasPdfs) return 'Estudiar mis PDFs ->'
  if (hasPredefined) return 'Empezar quiz ->'
  return 'Selecciona contenido ->'
}

onMounted(() => {
  isLoading.value = false
})

function goToProgress() {
  emit('view-progress')
}

function goToMultiplayer() {
  isLoading.value = true
  router.push({ path: '/multiplayer/' })
}

function goToGame(name) {
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
}
</script>
