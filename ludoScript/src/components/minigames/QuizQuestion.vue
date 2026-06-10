<template>
  <div class="flex flex-col items-center gap-6 md:gap-8 p-4 md:p-8 w-full max-w-3xl mx-auto">
    <!-- Contador de progreso -->
    <div class="text-white/60 text-sm font-medium">
      Pregunta {{ currentIndex + 1 }} de {{ totalItems }}
    </div>

    <!-- Enunciado -->
    <h2 class="text-white text-xl md:text-2xl font-bold text-center leading-snug">
      {{ question.question }}
    </h2>

    <!-- Opciones -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 w-full">
      <button
        v-for="(option, idx) in question.options"
        :key="idx"
        :disabled="answered"
        class="text-left px-4 py-4 md:px-6 md:py-5 rounded-2xl border-2 font-medium transition-all duration-300"
        :class="optionClass(idx)"
        @click="emit('select', idx)"
      >
        <span class="font-bold mr-2 opacity-60">{{ LABELS[idx] }}.</span>
        {{ option }}
      </button>
    </div>

    <!-- Feedback inmediato -->
    <transition name="fade">
      <div
        v-if="answered"
        class="w-full flex flex-col items-center gap-3"
      >
        <p
          class="text-lg font-semibold"
          :class="isCorrect ? 'text-emerald-400' : 'text-red-400'"
        >
          {{ isCorrect ? '¡Correcto!' : 'Incorrecto' }}
        </p>

        <!-- Explicación cuando se falla -->
        <div
          v-if="!isCorrect && question.explanation"
          class="max-w-xl w-full flex gap-3 bg-indigo-950/60 border border-indigo-800 rounded-lg px-4 py-3 text-sm text-indigo-100 leading-relaxed"
        >
          <span class="text-indigo-400 shrink-0 mt-0.5" aria-hidden="true">💡</span>
          <p>{{ question.explanation }}</p>
        </div>
      </div>
    </transition>

    <!-- Botón siguiente -->
    <button
      v-if="answered"
      class="w-full sm:w-auto bg-white text-gray-800 font-bold py-3 px-6 md:px-10 rounded-xl hover:bg-gray-100 transition-all"
      @click="emit('next')"
    >
      {{ isLastItem ? 'Ver resultado' : 'Siguiente →' }}
    </button>
  </div>
</template>

<script setup>
import { computed, toRef } from 'vue'
import { useQuizOptions } from '@/composables/useQuizOptions'

const LABELS = ['A', 'B', 'C', 'D']

const props = defineProps({
  question: { type: Object, required: true },
  currentIndex: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  selectedAnswer: { type: Number, default: null },
  answered: { type: Boolean, required: true },
  isLastItem: { type: Boolean, required: true },
})

const emit = defineEmits(['select', 'next'])

const isCorrect = computed(() => props.selectedAnswer === props.question.correct)

// useQuizOptions necesita refs; toRef mantiene la reactividad sin mutar props
const { optionClass } = useQuizOptions(
  toRef(props, 'question'),
  toRef(props, 'selectedAnswer'),
  toRef(props, 'answered'),
)
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
