<template>
  <div class="items-center grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-12 min-h-[60vh] mx-4 px-4 md:px-6 py-6 md:py-0">

    <!-- Personaje: oculto en móvil, visible en md+ -->
    <div class="hidden md:block bg-blue-950/20 pt-8 rounded-full">
      <Character />
    </div>

    <!-- HERO -->
    <div class="text-center flex flex-col gap-4 mx-auto w-full max-w-sm md:max-w-none order-first md:order-none">
      <h1 class="text-3xl font-righteous text-white">Quiz</h1>
      <p class="text-base text-gray-300">Pon a prueba tu nivel en 2–3 minutos</p>
      <p class="text-sm text-gray-500">🗂️ 15 preguntas · 🎯 4 opciones · ⏳ sin límite de tiempo</p>
      <div class="flex flex-col gap-2">
        <button
          class="w-full py-3 rounded-xl bg-yellow-600 cursor-pointer font-semibold font-righteous text-base transition-all hover:scale-[1.02] active:scale-[0.98]"
          @click="handleStart" autofocus>
          Comenzar Quiz →
        </button>
        <div class="flex flex-col gap-1 mt-1">
          <p class="text-xs text-gray-500">Puedes repetirlo todas las veces que quieras</p>
          <p class="text-xs text-gray-500">Resultados al instante</p>
        </div>
      </div>
    </div>

    <!-- SECCIONES COLAPSABLES -->
    <div class="flex flex-col gap-3 w-full md:p-8">
      <!-- A. ¿Cómo funciona? -->
      <div class="rounded-xl border border-gray-700/60 overflow-hidden">
        <button
          class="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800/50 transition-colors"
          @click="toggle(0)">
          <span>🎮 ¿Cómo funciona?</span>
          <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': open[0] }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-if="open[0]" class="px-4 pb-4 pt-1">
          <ul class="flex flex-col space-y-2 text-sm text-gray-400">
            <li>📋 Responde 15 preguntas de distintas áreas</li>
            <li>☝️ Elige una opción por pregunta</li>
            <li>🐢 Avanza a tu ritmo</li>
          </ul>
        </div>
      </div>
      <!-- B. Sistema de puntuación -->
      <div class="rounded-xl border border-gray-700/60 overflow-hidden">
        <button
          class="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800/50 transition-colors"
          @click="toggle(1)">
          <span>🏆 Sistema de puntuación</span>
          <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': open[1] }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-if="open[1]" class="px-4 pb-4 pt-1">
          <ul class="flex flex-col space-y-2 text-sm text-gray-400">
            <li>✅ <span class="text-emerald-400 font-bold">+1</span> punto por acierto</li>
            <li>❌ Cada 3 errores pierdes 1 punto</li>
            <li>🔒 Puntuación mínima: 0 puntos</li>
          </ul>
        </div>
      </div>
      <!-- C. Tu progreso -->
      <div class="rounded-xl border border-gray-700/60 overflow-hidden">
        <button
          class="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800/50 transition-colors"
          @click="toggle(2)">
          <span>📈 Tu progreso</span>
          <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': open[2] }"
            fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>
        <div v-if="open[2]" class="px-4 pb-4 pt-1">
          <ul class="flex flex-col space-y-2 text-sm text-gray-400">
            <li>🗺️ Comprueba que areas fallas</li>
            <li>💡 Repasa con explicaciones</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'
import Character from '../profile/Character.vue'

const open = reactive([false, false, false, false])

function toggle(index) {
  open[index] = !open[index]
}

const emit = defineEmits(['start'])

function handleStart() {
  emit('start')
}


</script>
