<template>
  <div
    class="flex flex-col lg:grid lg:grid-cols-[2fr_6fr_2fr] items-center gap-4 px-4 md:px-6 py-4 w-full max-w-6xl mx-auto"
  >
    <!-- Col 1: personaje + recompensa — oculto en móvil, visible en lg -->
    <div class="hidden lg:block">
      <img
        :src="characterImage"
        alt="estado personaje"
        class="w-full h-auto"
      >
      <Bonus :base-coins="props.earnedReward" />
      <div
        v-if="props.earnedReward > 0"
        class="px-10 mt-7 flex flex-col items-center gap-2"
      >
        <template v-if="rewardsStore.hasBonus && bonusResult">
          <div class="text-white/30 text-sm line-through">
            +{{ bonusResult.baseAmount }} monedas
          </div>
          <div
            class="reward-chip inline-flex items-center gap-2.5 bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 font-bold px-12 py-3 rounded-2xl text-lg tracking-tight"
          >
            <span class="text-2xl font-black">+{{ bonusResult.totalAmount }}</span>
            <img
              :src="IMAGES.coin"
              alt="moneda"
              class="w-8"
            >
          </div>
        </template>
        <template v-else-if="bonusResult">
          <div
            class="reward-chip inline-flex items-center gap-2.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold px-6 py-3 rounded-2xl text-lg tracking-tight"
          >
            <span class="text-2xl font-black">+{{ bonusResult.totalAmount }}</span>
            <img
              :src="IMAGES.coin"
              alt="moneda"
              class="w-8"
            >
          </div>
        </template>
        <p
          v-if="rankLabel"
          class="text-xs font-semibold mt-1"
          :class="rankColor"
        >
          {{ rankLabel }}
        </p>
      </div>
    </div>

    <!-- Col 2: tarjeta de resultados -->
    <div class="results-card w-full overflow-hidden">
      <div class="px-6 md:px-10 pt-2 pb-2 text-center">
        <h1
          class="text-xl md:text-2xl font-extrabold text-white tracking-tight"
          style="font-family: 'Righteous', sans-serif;"
        >
          {{ title }}
        </h1>
        <p
          v-if="message"
          class="text-white/35 text-xs mt-2 leading-relaxed"
        >
          {{ message }}
        </p>
      </div>

      <!-- Recompensa visible solo en móvil (en lg la muestra la col 1) -->
      <div
        v-if="props.earnedReward > 0"
        class="lg:hidden flex flex-col items-center gap-2 pt-3"
      >
        <template v-if="rewardsStore.hasBonus && bonusResult">
          <div class="text-white/30 text-sm line-through">
            +{{ bonusResult.baseAmount }} monedas
          </div>
          <div
            class="reward-chip inline-flex items-center gap-2.5 bg-emerald-400/15 border border-emerald-400/30 text-emerald-300 font-bold px-8 py-2.5 rounded-2xl text-base tracking-tight"
          >
            <span class="text-xl font-black">+{{ bonusResult.totalAmount }}</span>
            <img
              :src="IMAGES.coin"
              alt="moneda"
              class="w-7"
            >
          </div>
        </template>
        <template v-else-if="bonusResult">
          <div
            class="reward-chip inline-flex items-center gap-2.5 bg-amber-400/15 border border-amber-400/30 text-amber-300 font-bold px-6 py-2.5 rounded-2xl text-base tracking-tight"
          >
            <span class="text-xl font-black">+{{ bonusResult.totalAmount }}</span>
            <img
              :src="IMAGES.coin"
              alt="moneda"
              class="w-7"
            >
          </div>
        </template>
        <p
          v-if="rankLabel"
          class="text-xs font-semibold"
          :class="rankColor"
        >
          {{ rankLabel }}
        </p>
      </div>

      <div
        v-if="heroScore"
        class="px-6 md:px-10 pt-4 md:pt-5 pb-2 text-center"
      >
        <p class="hero-number leading-none select-none text-white">
          {{ heroScore }}
        </p>
        <p class="text-[0.6rem] uppercase tracking-[0.28em] text-white/25 mt-3 font-medium">
          puntuación final
        </p>
      </div>

      <div class="mx-6 md:mx-10 border-t border-white/8 mt-5 md:mt-7 mb-4 md:mb-6" />

      <div class="px-6 md:px-10 pb-6 md:pb-10 flex flex-col gap-3">
        <button
          class="bg-white text-gray-950 font-bold py-3.5 px-8 rounded-2xl shadow-[0_4px_24px_rgba(255,255,255,0.15)] hover:shadow-[0_4px_32px_rgba(255,255,255,0.25)] hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer w-full text-sm tracking-tight"
          @click="emit('restart')"
        >
          {{ restartLabel }}
        </button>
        <button
          class="border border-white/[0.1] text-white/40 font-medium py-3 px-8 rounded-2xl hover:bg-white/[0.05] hover:text-white/60 transition-all cursor-pointer w-full text-sm"
          @click="$router.push('/')"
        >
          Volver al inicio
        </button>
      </div>
    </div>

    <!-- Col 3: slot extra (stats) -->
    <div class="w-full">
      <div class="px-2 md:px-4 flex flex-col gap-5">
        <slot name="extra" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { IMAGES } from '@/utils/imgBucketStorage'
import Bonus from '../shared/Bonus.vue'
import { useRewardsStore } from '@/stores/rewards.store'

const props = defineProps({
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
const rewardsStore = useRewardsStore()

// Resultado del bonus tras claimActivityReward: { baseAmount, multiplier, totalAmount }
const bonusResult = ref(null)

const numericScore = computed(() => {
  const clean = typeof props.heroScore === 'string'
    ? props.heroScore.replace(/[^0-9.]/g, '')
    : props.heroScore
  return parseFloat(clean) || 0
})

onMounted(async () => {
  if (numericScore.value >= 5) {
    await rewardsStore.evaluateBonus()
  } else {
    rewardsStore.clearBonus() // ← asegura que no hay bonus residual
  }

  if (props.earnedReward > 0) {
    bonusResult.value = await rewardsStore.claimActivityReward(props.earnedReward)
  }
})

const characterImage = computed(() => {
  if (numericScore.value >= 7) return IMAGES.celebracion
  if (numericScore.value >= 5) return IMAGES.aprobado
  return IMAGES.suspenso
})
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
  font-family: 'Righteous', Georgia, serif;
  font-weight: 700;
  font-size: clamp(5rem, 22vw, 9.5rem);
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.reward-chip {
  box-shadow: 0 0 28px 0 rgba(251, 191, 36, 0.18);
}
</style>