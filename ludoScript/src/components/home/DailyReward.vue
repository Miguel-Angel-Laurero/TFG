<template>
  <Transition name="fade">
    <div v-if="showStreak" class="fixed inset-0 bg-black/60 z-40" />
  </Transition>

  <Transition name="fade">
    <Streak
      v-if="showStreak"
      class="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50"
      @close="showStreak = false"
    />
  </Transition>
</template>

<script setup>
import { ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import Streak from './Streak.vue'
import { useRewardsStore } from '@/stores/rewards.store'

const rewardsStore = useRewardsStore()
const { claimed, ready } = storeToRefs(rewardsStore)

// No mostramos nada hasta saber el estado real del servidor
const showStreak = ref(false)

// Si el store ya estaba listo al montar (ej. venimos del login), reaccionamos
// inmediatamente. Si no (recarga de página), esperamos a que fetchRewards()
// termine y ready pase a true.
watch(
  ready,
  (isReady) => {
    if (isReady) showStreak.value = !claimed.value
  },
  { immediate: true }
)

// Si el store aún no ha cargado (ready === false), lanzamos la petición
if (!ready.value) {
  rewardsStore.fetchRewards()
}
</script>