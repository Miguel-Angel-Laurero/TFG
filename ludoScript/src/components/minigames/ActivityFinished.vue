<template>
  <div class="flex flex-col items-center gap-6 p-10 w-full max-w-2xl mx-auto">
    <div class="bg-white/10 backdrop-blur rounded-3xl p-10 w-full text-center flex flex-col gap-6 shadow-2xl">

      <h1 class="text-4xl font-bold text-white">{{ title }}</h1>
      <p v-if="message" class="text-white/70 text-sm">{{ message }}</p>

      <!-- Contenido específico de la actividad (ej. puntuación del Quiz) -->
      <slot name="extra cursor-pointer" />

      <!-- Recompensa obtenida -->
      <div v-if="earnedReward > 0" class="bg-yellow-400/20 rounded-2xl p-5 flex flex-col items-center gap-1">
        <p class="text-white/70 text-sm">Recompensa obtenida</p>
        <p class="text-4xl font-extrabold text-yellow-300">+{{ earnedReward }} 🪙</p>
        <p v-if="rankLabel" class="text-sm font-semibold mt-1" :class="rankColor">
          {{ rankLabel }}
        </p>
      </div>

      <button @click="emit('restart')"
        class="bg-white text-gray-800 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
        {{ restartLabel }}
      </button>

      <button @click="$router.push('/')"
        class="font-bold py-3 px-8 rounded-xl transition-all text-blue-300 bg-blue-900/40 border border-blue-700/50 hover:bg-blue-800/50 cursor-pointer">
        Volver al inicio
      </button>

    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

defineProps({
  title: { type: String, default: '¡Actividad completada!' },
  message: { type: String, default: '' },
  restartLabel: { type: String, default: 'Volver a intentarlo' },
  earnedReward: { type: Number, default: 0 },
  rankLabel: { type: String, default: null },
  rankColor: { type: String, default: null },
})

const emit = defineEmits(['restart'])
const $router = useRouter()
</script>