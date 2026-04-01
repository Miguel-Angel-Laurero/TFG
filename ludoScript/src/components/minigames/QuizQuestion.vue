<template>
  <div class="flex flex-col items-center gap-8 p-8 w-full max-w-3xl mx-auto">

    <!-- Contador de progreso -->
    <div class="text-white/60 text-sm font-medium">
      Pregunta {{ currentIndex + 1 }} de {{ totalItems }}
    </div>

    <!-- Enunciado -->
    <h2 class="text-white text-2xl font-bold text-center leading-snug">
      {{ question.question }}
    </h2>

    <!-- Opciones -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
      <button
        v-for="(option, idx) in question.options"
        :key="idx"
        :disabled="answered"
        @click="emit('select', idx)"
        class="text-left px-6 py-5 rounded-2xl border-2 font-medium transition-all duration-300"
        :class="optionClass(idx)"
      >
        <span class="font-bold mr-2 opacity-60">{{ LABELS[idx] }}.</span>
        {{ option }}
      </button>
    </div>

    <!-- Feedback inmediato -->
    <transition name="fade">
      <p
        v-if="answered"
        class="text-lg font-semibold"
        :class="isCorrect ? 'text-emerald-400' : 'text-red-400'"
      >
        {{ isCorrect ? '¡Correcto!' : 'Incorrecto' }}
      </p>
    </transition>

    <!-- Botón siguiente -->
    <button
      v-if="answered"
      @click="emit('next')"
      class="bg-white text-gray-800 font-bold py-3 px-10 rounded-xl hover:bg-gray-100 transition-all"
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
  question:       { type: Object,  required: true },
  currentIndex:   { type: Number,  required: true },
  totalItems:     { type: Number,  required: true },
  selectedAnswer: { type: Number,  default: null  },
  answered:       { type: Boolean, required: true },
  isLastItem:     { type: Boolean, required: true },
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
.fade-enter-active, .fade-leave-active { transition: opacity 0.3s ease; }
.fade-enter-from,  .fade-leave-to      { opacity: 0; }
</style>
