<template>
  <!-- ── Repaso completado ─────────────────────────────────────────────── -->
  <div v-if="phase === 'done'" class="flex flex-col items-center gap-10 p-16 bg-emerald-600/80 rounded-2xl border-emerald-600">
    <div class="text-white text-xl rounded-xl p-4 font-bold transition-all">
      <p>¡Repaso Completado!</p>
      <p class="text-sm">Has terminado todas las preguntas del temario. Sigue practicando para afianzar el contenido</p>
    </div>
    <button @click.stop="handleRestart" class="hover:bg-white border border-gray-200 rounded-xl p-4 hover:cursor-pointer font-bold transition-all">
      Volver al principio
    </button>
  </div>

  <!-- ── Introducción al repaso adaptativo ────────────────────────────── -->
  <div v-else-if="phase === 'adaptive-intro'" class="flex flex-col items-center gap-6 p-10 text-center">
    <div class="text-4xl">🧠</div>
    <h2 class="text-white text-2xl font-bold">Repaso Adaptativo</h2>
    <p class="text-white/70 max-w-sm">
      Has fallado <strong class="text-yellow-400">{{ adaptive.failedCards.value.length }}</strong>
      {{ adaptive.failedCards.value.length === 1 ? 'pregunta' : 'preguntas' }}.
      El sistema ha seleccionado preguntas relacionadas con los temas que necesitas reforzar.
    </p>
    <p class="text-white/50 text-sm">{{ adaptiveCards.length }} preguntas en el repaso adaptativo</p>
    <button
      @click="startAdaptive"
      class="bg-yellow-400 text-black font-bold rounded-xl px-8 py-3 hover:bg-yellow-300 transition-all"
    >
      Empezar repaso →
    </button>
    <button
      @click="handleRestart"
      class="text-white/40 text-sm hover:text-white/70 transition-colors"
    >
      Saltar repaso adaptativo
    </button>
  </div>

  <!-- ── Flashcard (primera pasada o repaso adaptativo) ───────────────── -->
  <div v-else class="flex flex-col items-center gap-8 p-10">
    <!-- Cabecera de fase -->
    <div class="flex flex-col items-center gap-1">
      <span
        v-if="phase === 'adaptive'"
        class="text-xs font-bold tracking-widest text-yellow-400 uppercase bg-yellow-400/10 px-3 py-1 rounded-full"
      >
        🧠 Repaso Adaptativo
      </span>
      <p class="text-white">
        Pregunta: {{ currentIndex + 1 }} /
        {{ phase === 'adaptive' ? adaptiveCards.length : initialCards.length }}
      </p>
    </div>

    <!-- Carta -->
    <div v-if="currentCard" class="w-96 h-64 cursor-pointer" style="perspective: 1000px" @click="flip">
      <div
        class="relative w-full h-full transition-all duration-700"
        :style="{
          transformStyle: 'preserve-3d',
          transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
        }"
      >
        <!-- Frente: Pregunta -->
        <div
          class="absolute inset-0 bg-white border border-gray-200 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8"
          style="backface-visibility: hidden"
        >
          <span class="text-[10px] font-bold tracking-widest text-gray-400 uppercase mb-4">Pregunta</span>
          <p class="text-2xl font-bold text-gray-800 text-center">{{ currentCard.question }}</p>
        </div>

        <!-- Reverso: Respuesta -->
        <div
          class="absolute inset-0 bg-sky-200 border border-gray-100 rounded-3xl shadow-xl flex flex-col items-center justify-center p-8"
          style="backface-visibility: hidden; transform: rotateY(180deg)"
        >
          <span class="text-[10px] font-bold tracking-widest text-gray-500 uppercase mb-4">Respuesta</span>
          <p class="text-2xl font-semibold text-gray-600 text-center">{{ currentCard.answer }}</p>
        </div>
      </div>
    </div>

    <!-- Pista antes de voltear -->
    <p
      class="text-xs text-white/45 font-medium transition-opacity duration-300"
      :class="isFlipped ? 'opacity-0' : 'opacity-100'"
    >
      Toca la carta para ver la respuesta
    </p>

    <!-- Botones de autoevaluación (solo visibles tras voltear, primera pasada) -->
    <div
      v-if="isFlipped && phase === 'initial'"
      class="flex gap-4 transition-opacity duration-300"
    >
      <button
        @click.stop="handleKnew"
        class="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-xl px-6 py-3 transition-all"
      >
        ✓ Lo sabía
      </button>
      <button
        @click.stop="handleDidNotKnow"
        class="flex items-center gap-2 bg-red-500 hover:bg-red-400 text-white font-bold rounded-xl px-6 py-3 transition-all"
      >
        ✗ No lo sabía
      </button>
    </div>

    <!-- Botón siguiente (repaso adaptativo) -->
    <button
      v-if="isFlipped && phase === 'adaptive'"
      @click.stop="handleAdaptiveNext"
      class="bg-white border border-gray-200 text-black rounded-xl p-4 hover:cursor-pointer font-bold transition-all"
    >
      Siguiente →
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { useFlashcards } from '@/composables/useFlashCards'
import { useGameProgress } from '@/composables/useGameProgress'
import { useAdaptiveSystem } from '@/composables/useAdaptiveSystem'

const { progress, updateProgress } = useGameProgress()
const initialCards = ref([])
const loading = ref(true)

/**
 * phase: 'initial' → primera pasada normal
 *        'adaptive-intro' → pantalla de introducción al repaso adaptativo
 *        'adaptive' → repaso adaptativo en curso
 *        'done' → todo completado
 */
const phase = ref('initial')
const adaptiveCards = ref([])
const activeCards = ref([])

onMounted(async () => {
  try {
    const response = await fetch('/flashCards.json')
    initialCards.value = await response.json()
    activeCards.value = initialCards.value
    updateProgress(0)
  } catch (error) {
    console.error("Error al cargar los datos", error)
  } finally {
    loading.value = false
  }
})

// Adaptive system operates over the full card pool
const adaptive = useAdaptiveSystem(initialCards)

// Flashcard composable: currentCards changes depending on the active phase
const { currentCard, isFlipped, flip, next, restart, currentIndex } = useFlashcards(activeCards)

/** User correctly self-assessed a card → advance without recording failure */
const handleKnew = () => {
  advanceInitialPhase()
}

/** User self-assessed as wrong → record failure then advance */
const handleDidNotKnow = () => {
  if (currentCard.value) {
    adaptive.recordFailure(currentCard.value)
  }
  advanceInitialPhase()
}

/** Move to the next card in the initial phase or transition to adaptive intro */
const advanceInitialPhase = () => {
  const total = initialCards.value.length
  if (currentIndex.value >= total - 1) {
    // First pass done — decide next step
    if (adaptive.failedCards.value.length > 0) {
      adaptiveCards.value = adaptive.buildAdaptiveSequence()
      phase.value = 'adaptive-intro'
    } else {
      updateProgress(100)
      phase.value = 'done'
    }
  } else {
    next()
  }
}

/** Start the adaptive review session */
const startAdaptive = () => {
  activeCards.value = adaptiveCards.value
  restart()
  phase.value = 'adaptive'
  updateProgress(0)
}

/** Advance within the adaptive review or finish */
const handleAdaptiveNext = () => {
  const total = adaptiveCards.value.length
  if (currentIndex.value >= total - 1) {
    updateProgress(100)
    phase.value = 'done'
  } else {
    next()
  }
}

/** Full restart: reset everything and go back to the initial phase */
const handleRestart = () => {
  adaptive.reset()
  adaptiveCards.value = []
  activeCards.value = initialCards.value
  restart()
  updateProgress(0)
  phase.value = 'initial'
}

// Update progress bar during initial pass
watch(currentIndex, (newVal) => {
  if (phase.value === 'initial') {
    const total = initialCards.value.length
    if (total > 0 && newVal > 0 && newVal < total) {
      updateProgress(Math.round((newVal / total) * 100))
    }
  } else if (phase.value === 'adaptive') {
    const total = adaptiveCards.value.length
    if (total > 0 && newVal > 0 && newVal < total) {
      updateProgress(Math.round((newVal / total) * 100))
    }
  }
})
</script>