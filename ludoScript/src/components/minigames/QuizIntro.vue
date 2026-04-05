<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] px-6 py-10">
    <div class="w-full max-w-xl bg-gray-900/90 border border-indigo-900 rounded-2xl p-8 flex flex-col gap-6">

      <!-- Header -->
      <div class="flex items-center gap-4">
        <span class="text-5xl" aria-hidden="true">&#129504;</span>
        <div>
          <h1 class="text-2xl font-righteous text-white">Quiz de JavaScript</h1>
          <p class="text-sm text-gray-400 mt-0.5">Pon a prueba tu conocimiento</p>
        </div>
      </div>

      <hr class="border-indigo-900" />

      <!-- Rules sections -->
      <div class="flex flex-col gap-5 text-sm text-gray-300">

        <!-- How it works -->
        <div>
          <h2 class="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Como funciona</h2>
          <ul class="flex flex-col gap-2">
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 shrink-0 mt-0.5" aria-hidden="true">&#8226;</span>
              Se presentan <strong class="text-white">15 preguntas</strong> de distintas areas de JavaScript.
            </li>
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 shrink-0 mt-0.5" aria-hidden="true">&#8226;</span>
              Selecciona la respuesta correcta entre 4 opciones. No hay limite de tiempo.
            </li>
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 shrink-0 mt-0.5" aria-hidden="true">&#8226;</span>
              Puedes avanzar a la siguiente pregunta una vez respondas la actual.
            </li>
          </ul>
        </div>

        <!-- Scoring -->
        <div>
          <h2 class="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Puntuacion</h2>
          <ul class="flex flex-col gap-2">
            <li class="flex items-start gap-2">
              <span class="text-emerald-400 shrink-0 font-bold mt-0.5" aria-hidden="true">+1</span>
              Punto por cada respuesta <strong class="text-white">correcta</strong>.
            </li>
            <li class="flex items-start gap-2">
              <span class="text-red-400 shrink-0 font-bold mt-0.5" aria-hidden="true">-&#8531;</span>
              Cada <strong class="text-white">3 errores</strong> restan 1 punto a tu puntuacion final.
            </li>
            <li class="flex items-start gap-2">
              <span class="text-gray-400 shrink-0 mt-0.5" aria-hidden="true">&#8226;</span>
              La puntuacion minima es <strong class="text-white">0</strong> &mdash; los errores no pueden darte una puntuacion negativa.
            </li>
          </ul>
        </div>

        <!-- Ranks -->
        <div>
          <h2 class="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Rangos</h2>
          <div class="grid grid-cols-2 gap-2">
            <div v-for="rank in RANKS" :key="rank.label"
              class="flex items-center gap-2 bg-gray-800/60 rounded-lg px-3 py-2">
              <span class="text-lg" aria-hidden="true">{{ rank.icon }}</span>
              <div>
                <p class="font-semibold leading-none" :class="rank.color">{{ rank.label }}</p>
                <p class="text-[11px] text-gray-500">{{ rank.range }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Progress tracking -->
        <div>
          <h2 class="text-xs font-semibold text-indigo-400 uppercase tracking-widest mb-2">Registro de progreso</h2>
          <ul class="flex flex-col gap-2">
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 shrink-0 mt-0.5" aria-hidden="true">&#128202;</span>
              Tus aciertos por area tematica se guardan al terminar y se reflejan en el <strong class="text-white">mapa de dominio</strong> de la pantalla de inicio.
            </li>
            <li class="flex items-start gap-2">
              <span class="text-indigo-400 shrink-0 mt-0.5" aria-hidden="true">&#128161;</span>
              Las preguntas que falles las podras repasar con explicaciones desde el mapa de dominio.
            </li>
            <li class="flex items-start gap-2">
              <span class="text-yellow-400 shrink-0 mt-0.5" aria-hidden="true">&#11088;</span>
              Completar el quiz otorga monedas segun tu rango, que puedes canjear en la tienda.
            </li>
          </ul>
        </div>

      </div>

      <!-- CTA -->
      <button
        class="mt-2 w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-righteous text-lg transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400"
        @click="$emit('start')"
        autofocus
      >
        Comenzar Quiz
      </button>

    </div>
  </div>
</template>

<script setup>
defineEmits(['start'])

const RANKS = [
  { label: 'Bronce',   range: '0–4 pts',   icon: '🥉', color: 'text-orange-400' },
  { label: 'Plata',    range: '5–9 pts',   icon: '🥈', color: 'text-gray-300' },
  { label: 'Oro',      range: '10–12 pts', icon: '🥇', color: 'text-yellow-400' },
  { label: 'Platino',  range: '13–15 pts', icon: '💎', color: 'text-cyan-300' },
]
</script>