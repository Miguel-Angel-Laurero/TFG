<template>
  <div class="flex flex-col items-center justify-center max-h-screen">
    <component v-if="selectedGame" :is="selectedGame" />
  </div>
</template>
<script setup>
import { ref, watch } from 'vue'
import Quiz from './Quiz.vue'
import FlashCard from './FlashCard.vue'
const props = defineProps({ initialGame: String })

const games = [
  { name: 'quiz', label: 'Quiz', component: Quiz },
  { name: 'flashcards', label: 'Flashcards', component: FlashCard },
]

const selectedGame = ref(null)

watch(
  () => props.initialGame,
  (val) => {
    const found = games.find(g => g.name === val)
    selectedGame.value = found ? found.component : null
  },
  { immediate: true }
)
</script>
