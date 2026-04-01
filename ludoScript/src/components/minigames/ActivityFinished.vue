<template>
  <!-- ─────────────────────────────────────────────────────────────────────
       Pantalla de fin GENÉRICA compartida por todas las actividades.

       · El título y el mensaje se pasan como props para que cada actividad
         muestre su propio texto.
       · El slot "extra" permite que actividades como el Quiz inyecten su
         bloque de puntuación sin romper el layout base.
       ───────────────────────────────────────────────────────────────────── -->
  <div class="flex flex-col items-center gap-6 p-10 w-full max-w-2xl mx-auto">
    <div class="bg-white/10 backdrop-blur rounded-3xl p-10 w-full text-center flex flex-col gap-6 shadow-2xl">

      <h1 class="text-4xl font-bold text-white">{{ title }}</h1>
      <p v-if="message" class="text-white/70 text-sm">{{ message }}</p>

      <!-- Contenido específico de la actividad (ej. bloque de puntuación) -->
      <slot name="extra" />

      <button
        @click="emit('restart')"
        class="bg-white text-gray-800 font-bold py-3 px-8 rounded-xl hover:bg-gray-100 transition-all"
      >
        {{ restartLabel }}
      </button>

      <button
        @click="confirmExit"
        class="bg-red-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-600 transition-colors"
      >
        Salir del minijuego
      </button>

    </div>
  </div>
</template>

<script setup>
import { useGameExit } from '@/composables/useGameExit'

defineProps({
  title:        { type: String, default: '¡Actividad completada!' },
  message:      { type: String, default: '' },
  restartLabel: { type: String, default: 'Volver a intentarlo' },
})

const emit = defineEmits(['restart'])

const { confirmExit } = useGameExit()
</script>