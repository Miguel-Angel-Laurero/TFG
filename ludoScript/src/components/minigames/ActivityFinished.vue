<template>
  <div class="flex flex-col items-center p-6 w-full max-w-xl mx-auto">
    <div
      class="results-card bg-gradient-to-b from-white/[0.07] to-white/[0.02] backdrop-blur-2xl border border-white/[0.12] rounded-[2rem] w-full overflow-hidden shadow-[0_40px_100px_-20px_rgba(0,0,0,0.7)]">

      <!-- Cabecera con título -->
      <div class="px-10 pt-10 pb-2 text-center">
        <h1 class="text-2xl font-extrabold text-white tracking-tight"
          style="font-family: 'Playfair Display', Georgia, serif;">{{ title }}</h1>
        <p v-if="message" class="text-white/35 text-xs mt-2 leading-relaxed">{{ message }}</p>
      </div>

      <!-- Hero Score -->
      <div v-if="heroScore" class="px-10 pt-5 pb-2 text-center">
        <p class="hero-number leading-none select-none text-white">
          {{ heroScore }}
        </p>
        <p class="text-[0.6rem] uppercase tracking-[0.28em] text-white/25 mt-3 font-medium">puntuación final</p>
      </div>

      <!-- Divisor sutil -->
      <div class="mx-10 border-t border-white/[0.08] mt-7 mb-6" />

      <!-- Stats + adaptativo (slot) -->
      <div class="px-10 flex flex-col gap-5">
        <slot name="extra" />
      </div>

      <!-- Recompensa: badge con glow dorado -->
      <div v-if="earnedReward > 0" class="px-10 mt-7 flex flex-col items-center gap-2">
        <Bonus />
        <div
          class="reward-chip inline-flex items-center gap-2.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold px-6 py-3 rounded-2xl text-lg tracking-tight">
          <span class="text-2xl font-black">+{{ earnedReward }}</span>
          <img :src="IMAGES.coin" alt="moneda" class="w-8"/>
        </div>
        <p v-if="rankLabel" class="text-xs font-semibold mt-1" :class="rankColor">{{ rankLabel }}</p>
      </div>

      <!-- Acciones -->
      <div class="px-10 pt-8 pb-10 flex flex-col gap-3">
        <button @click="emit('restart')"
          class="bg-white text-gray-950 font-bold py-3.5 px-8 rounded-2xl shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_32px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full text-sm tracking-tight">
          {{ restartLabel }}
        </button>
        <button @click="$router.push('/')"
          class="border border-white/[0.1] text-white/40 font-medium py-3 px-8 rounded-2xl hover:bg-white/[0.05] hover:text-white/60 transition-all cursor-pointer w-full text-sm">
          Volver al inicio
        </button>
      </div>
    </div>
  </div>
 
</template>

<script setup>
import { useRouter } from 'vue-router'
import { IMAGES } from '@/utils/imgBucketStorage'
import Bonus from '../shared/Bonus.vue'

defineProps({
  title: { type: String, default: '¡Actividad completada!' },
  message: { type: String, default: '' },
  restartLabel: { type: String, default: 'Volver a intentarlo' },
  earnedReward: { type: Number, default: 0 },
  rankLabel: { type: String, default: null },
  rankColor: { type: String, default: null },
  heroScore: { type: String, default: null },
})

const emit = defineEmits(['restart'])
const $router = useRouter()
</script>

<style scoped>
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(28px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.results-card {
  animation: fadeInUp 0.5s cubic-bezier(0.22, 1, 0.36, 1) both;
}

.hero-number {
  font-family: 'Playfair Display', Georgia, serif;
  font-weight: 700;
  font-size: clamp(5rem, 22vw, 9.5rem);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.reward-chip {
  box-shadow: 0 0 28px 0 rgba(251, 191, 36, 0.18);
}
</style>