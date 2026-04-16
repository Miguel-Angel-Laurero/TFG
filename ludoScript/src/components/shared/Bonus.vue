<template>
    <div class="mt-2 text-center">
        <!-- Bonus activo -->
        <div v-if="rewardsStore.hasBonus" class="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-2xl">
            <p class="text-emerald-400 font-bold">¡Multiplicador de Bonus Activo!</p>
            <p class="text-3xl font-black text-emerald-300">x{{ rewardsStore.currentMultiplier }}</p>
        </div>

        <!-- Sin bonus: muestra probabilidad actual del jugador (reactiva vía computed) -->
        <div v-else class="text-white/60 text-[0.65rem] uppercase tracking-widest">
            Próximo bonus en aumento: {{ bonusPercentage }}%
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRewardsStore } from '@/stores/rewards.store'
import { useAuthStore } from '@/stores/auth.store'
import { IMAGES } from '@/utils/imgBucketStorage'

const props = defineProps({
  baseCoins: { type: Number, default: 0 },
})

const rewardsStore = useRewardsStore()
const authStore    = useAuthStore()

// computed reactivo: se actualiza automáticamente cuando userData.bonusPercentage cambia
const bonusPercentage = computed(
  () => authStore.userData?.bonusPercentage ?? rewardsStore.BASE_BONUS_PERCENTAGE
)

const totalCoins = computed(() =>
  rewardsStore.hasBonus
    ? Math.round(props.baseCoins * rewardsStore.currentMultiplier)
    : props.baseCoins
)
</script>