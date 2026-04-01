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
import { useRoute }            from 'vue-router'
import { useActivitySession } from '@/composables/useActivitySession'
import { useActivityReward }  from '@/composables/useActivityReward' 
import ActivityLoading        from './ActivityLoading.vue'
import ActivityFinished       from './ActivityFinished.vue'
import FlashCardDeck          from './FlashCardDeck.vue'

const route = useRoute()

// Si el usuario viene desde un PDF propio (ruta con ?pdfId=:id), se cargan las
// flashcards desde la API (autenticada). Si no, se usan las tarjetas estáticas.
const flashCardsUrl = route.query.pdfId
  ? `/api/pdfs/${route.query.pdfId}/flashcards`
  : '/flashCards.json'

const {
  loading, finished, currentIndex, currentItem, totalItems, isLastItem,
  load, next, restart,
} = useActivitySession(flashCardsUrl)

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
