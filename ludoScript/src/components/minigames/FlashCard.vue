<template>
  <ActivityLoading v-if="loading" />

  <ActivityFinished
    v-else-if="finished"
    title="¡Repaso Completado!"
    message="Has terminado todas las preguntas del temario. Sigue practicando para afianzar el contenido."
    restart-label="Volver al principio"
    @restart="handleRestart"
  />

  <FlashCardDeck
    v-else
    :card="currentItem"
    :current-index="currentIndex"
    :total-items="totalItems"
    :is-flipped="isFlipped"
    :is-last-item="isLastItem"
    @flip="toggleFlip"
    @next="handleNext"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useActivitySession } from '@/composables/useActivitySession'
import { useActivityReward }  from '@/composables/useActivityReward' 
import ActivityLoading        from './ActivityLoading.vue'
import ActivityFinished       from './ActivityFinished.vue'
import FlashCardDeck          from './FlashCardDeck.vue'

const {
  loading, finished, currentIndex, currentItem, totalItems, isLastItem,
  load, next, restart,
} = useActivitySession('/flashCards.json')

onMounted(load)

const { earnedReward, grantReward } = useActivityReward({ base: 25 })

const isFlipped = ref(false)

function toggleFlip() {
  isFlipped.value = !isFlipped.value
}

async function handleNext() {        // 👈 async
  if (isLastItem.value) {
    await grantReward()              // 👈 otorga la recompensa en el último item
  }
  next(() => {
    isFlipped.value = false
  })
}

function handleRestart() {
  restart(() => {
    isFlipped.value = false
  })
}
</script>
