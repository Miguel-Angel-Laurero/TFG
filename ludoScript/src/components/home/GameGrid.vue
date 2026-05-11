<template>
  <div class="flex flex-col gap-5">
    <header class="flex flex-col gap-2">
      <p class="text-xs font-black uppercase tracking-[0.22em] text-cyan-300">Modos de estudio</p>
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
      <article
        class="group relative overflow-hidden rounded-3xl border border-yellow-400/45 bg-slate-900/80 px-5 py-5 shadow-[0_18px_44px_rgba(2,6,23,0.38)] backdrop-blur-md transition-all duration-300 hover:-translate-y-1 hover:border-yellow-300/75 hover:shadow-[0_18px_52px_rgba(234,179,8,0.18)] sm:px-7 sm:py-7"
      >
        <div class="absolute inset-0 bg-[radial-gradient(circle_at_15%_0%,rgba(250,204,21,0.16),transparent_32%),linear-gradient(135deg,rgba(99,102,241,0.12),transparent_42%)]"></div>

        <div class="relative flex min-h-[250px] flex-col justify-between gap-7">
          <div class="flex items-start gap-4">
            <span class="inline-flex items-center rounded-full border border-yellow-400/35 bg-yellow-400/10 px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wide text-yellow-200">
              Recomendado para ti
            </span>
          </div>

          <div class="flex items-center gap-4 sm:gap-5">
            <div class="flex h-20 w-20 shrink-0 items-center justify-center rounded-3xl bg-white/8 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 sm:h-24 sm:w-24">
              <img :src="IMAGES.quiz" alt="" class="h-14 w-14 object-contain sm:h-16 sm:w-16" />
            </div>

            <div class="min-w-0">
              <h3 class="font-righteous text-2xl font-black leading-tight text-white sm:text-3xl">Quiz</h3>
              <p class="mt-2 max-w-md text-sm leading-relaxed text-indigo-100/85 sm:text-base">
                Pon a prueba tu conocimiento del tema.
              </p>
            </div>
          </div>

          <button
            type="button"
            class="inline-flex h-14 w-full items-center justify-center rounded-2xl bg-indigo-600 px-5 text-center font-righteous text-base font-bold text-white shadow-lg shadow-indigo-950/30 transition-colors duration-200 hover:bg-indigo-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300 active:scale-[0.99] sm:text-lg"
            @click="goToGame('Quiz')"
          >
            {{ gameButtonText('Quiz') }}
          </button>
        </div>
      </article>

      <div class="flex items-center justify-between gap-3 pt-2">
        <h3 class="font-righteous text-sm font-bold text-indigo-200 sm:text-base">Todos los modos</h3>
        <button
          type="button"
          class="inline-flex h-11 items-center justify-center rounded-2xl border border-white/15 bg-white/10 px-4 font-righteous text-sm font-bold text-white transition-colors duration-200 hover:bg-white/15 focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-300"
          @click="goToProgress"
        >
          Ver progreso
        </button>
      </div>

      <div class="flex flex-col gap-3">
        <article
          v-for="mode in modes"
          :key="mode.name"
          class="group relative grid grid-cols-[auto_1fr_auto] items-center gap-3 rounded-3xl border px-4 py-4 backdrop-blur-md transition-all duration-300 hover:-translate-y-0.5 sm:gap-4 sm:px-5 sm:py-5"
          :class="mode.cardClass"
          @click="mode.action"
        >
          <div class="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/8 ring-1 ring-white/10 transition-transform duration-300 group-hover:scale-105 sm:h-[72px] sm:w-[72px]">
            <img :src="mode.image" alt="" class="h-11 w-11 object-contain sm:h-12 sm:w-12" />
          </div>

          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h4 class="font-righteous text-lg font-black leading-tight text-white sm:text-xl">{{ mode.name }}</h4>
              <span
                v-if="mode.badge"
                class="rounded-full bg-emerald-400/15 px-2 py-0.5 text-[10px] font-black uppercase text-emerald-300"
              >
                {{ mode.badge }}
              </span>
            </div>
            <p class="mt-1 text-xs leading-snug text-indigo-100/75 sm:text-sm">{{ mode.description }}</p>
          </div>

          <button
            type="button"
            class="pointer-events-none inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-indigo-600/45 text-xl font-bold text-white transition-colors duration-200 group-hover:bg-indigo-500/70"
            aria-hidden="true"
          >
            ->
          </button>
        </article>
      </div>

      <div
        v-if="noSelectionWarning"
        class="flex items-start gap-2 bg-amber-900/30 border border-amber-500/40 rounded-lg px-3 py-2"
      >
        <span class="text-amber-400 mt-0.5">!</span>
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

const modes = [
  {
    name: 'Quiz',
    description: 'Pon a prueba tu conocimiento del tema.',
    image: IMAGES.quiz,
    badge: 'mejor hoy',
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
