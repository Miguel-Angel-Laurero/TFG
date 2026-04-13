<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-4 pt-7 pb-12">

    <!-- CARD -->
    <div class="w-full max-w-md bg-gray-900 border border-indigo-900/50 rounded-2xl shadow-xl p-7 flex flex-col gap-6">

      <!-- HERO -->
      <div class="text-center flex flex-col gap-2">
        <div class="text-5xl mb-1" aria-hidden="true">🧠</div>
        <h1 class="text-3xl font-righteous text-white">Quiz de JavaScript</h1>
        <p class="text-base text-gray-300">Pon a prueba tu nivel en 2–3 minutos</p>
        <p class="text-sm text-gray-500">🗂️ 15 preguntas · 🎯 4 opciones · ⏳ sin límite de tiempo</p>
      </div>

      <!-- CTA PRINCIPAL -->
      <div class="flex flex-col gap-2">
        <button
          class="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white font-semibold text-base transition-all hover:scale-[1.02] hover:shadow-lg hover:shadow-indigo-500/40 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-indigo-400"
          @click="handleStart" autofocus>
          🚀 Comenzar Quiz →
        </button>
        <div class="flex flex-col gap-1 mt-1">
          <p class="text-xs text-gray-500">✔ Puedes repetirlo todas las veces que quieras</p>
          <p class="text-xs text-gray-500">✔ Resultados al instante</p>
        </div>
      </div>

      <!-- SECCIONES COLAPSABLES -->
      <div class="flex flex-col gap-3">

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
              <li>🗺️ Verás en qué áreas fallas</li>
              <li>💡 Podrás repasar con explicaciones</li>
            </ul>
          </div>
        </div>

        <!-- D. Rangos -->
        <div class="rounded-xl border border-gray-700/60 overflow-hidden">
          <button
            class="flex items-center justify-between w-full px-4 py-3 text-sm font-semibold text-gray-200 hover:bg-gray-800/50 transition-colors"
            @click="toggle(3)">
            <span>🎖️ Rangos</span>
            <svg class="w-4 h-4 text-gray-400 transition-transform duration-200" :class="{ 'rotate-180': open[3] }"
              fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <div v-if="open[3]" class="px-4 pb-4 pt-1">
            <div class="grid grid-cols-2 gap-2">
              <div v-for="rank in RANKS" :key="rank.label"
                class="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
                <span class="text-lg" aria-hidden="true">{{ rank.icon }}</span>
                <div>
                  <p class="font-semibold leading-none text-sm" :class="rank.color">{{ rank.label }}</p>
                  <p class="text-[11px] text-gray-500">{{ rank.range }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
import { reactive } from 'vue'

const RANKS = [
  { label: 'Bronce', range: '0–4 pts', icon: '🥉', color: 'text-orange-400' },
  { label: 'Plata', range: '5–9 pts', icon: '🥈', color: 'text-gray-300' },
  { label: 'Oro', range: '10–12 pts', icon: '🥇', color: 'text-yellow-400' },
  { label: 'Platino', range: '13–15 pts', icon: '💎', color: 'text-cyan-300' },
]

const open = reactive([false, false, false, false])

function toggle(index) {
  open[index] = !open[index]
}

const emit = defineEmits(['start'])

function handleStart() {
  emit('start')
}


</script>
