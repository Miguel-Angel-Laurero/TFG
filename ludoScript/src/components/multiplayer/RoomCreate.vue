<template>
  <div class="flex flex-col items-center gap-6 w-full max-w-md mx-auto p-6">
    <h2 class="text-white text-2xl font-bold">
      Crear sala
    </h2>
    <p class="text-white/60 text-sm text-center">
      Crea una sala y comparte el código con tus amigos.
    </p>

    <div class="w-full flex flex-col gap-4">
      <label class="text-white/80 text-sm font-semibold">
        Número de preguntas
        <input
          v-model.number="questionCount"
          type="number"
          min="3"
          max="20"
          class="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
      </label>

      <label class="text-white/80 text-sm font-semibold">
        Segundos por pregunta
        <input
          v-model.number="timePerQuestion"
          type="number"
          min="5"
          max="60"
          class="mt-1 w-full bg-white/10 border border-white/20 rounded-xl px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-400"
        >
      </label>
    </div>

    <button
      :disabled="loading"
      class="w-full bg-yellow-400 text-gray-900 font-bold py-3 rounded-xl cursor-pointer hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all "
      @click="handleCreate"
    >
      {{ loading ? 'Creando…' : 'Crear sala' }}
    </button>

    <button
      class="text-white/50 cursor-pointer hover:text-white text-sm transition-colors"
      @click="emit('cancel')"
    >
      Cancelar
    </button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useMultiplayerStore } from '@/stores/multiplayer.store'

const emit = defineEmits(['cancel'])
const mp = useMultiplayerStore()

const questionCount = ref(10)
const timePerQuestion = ref(20)
const loading = ref(false)

function handleCreate() {
    loading.value = true
    mp.createRoom({ questionCount: questionCount.value, timePerQuestion: timePerQuestion.value })
    // El store emitirá room:created y cambiará status a 'lobby'
    // Si hay error, loading se queda pero el error aparecerá en MultiplayerView
    setTimeout(() => { loading.value = false }, 3000)
}
</script>
