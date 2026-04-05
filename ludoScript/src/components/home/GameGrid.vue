<template>
  <div class="flex flex-col gap-3">
    <div v-for="minigame in minigames" :key="minigame.id"
      class="flex items-center gap-6 px-7 py-6 rounded-2xl bg-gray-900/80 border border-blue-900 cursor-pointer hover:border-blue-500 hover:bg-blue-950/60 transition-all"
      @click="goToGame(minigame.name)">
      <span class="text-4xl select-none">{{ gameIcon(minigame.name) }}</span>
      <div class="flex-1 min-w-0">
        <p class="text-xl font-righteous text-white">{{ minigame.name }}</p>
        <p class="text-sm text-gray-400 mt-0.5">{{ minigame.description }}</p>
      </div>
      <span class="text-blue-400 font-semibold shrink-0 text-sm">Empezar →</span>
    </div>
  </div>
</template>
<script setup>
import { useRouter } from 'vue-router'
import { ref, onMounted } from 'vue'

const router = useRouter()
const minigames = ref([])

const GAME_ICONS = {
  Quiz: '🧠',
  Flashcards: '🃏',
}

function gameIcon(name) {
  return GAME_ICONS[name] ?? '🎮'
}

onMounted(async () => {
  try {
    const response = await fetch('/games.json')
    minigames.value = await response.json()
  } catch (error) {
    console.error("Error al cargar los datos", error)
  }
})

function goToGame(name) {
  router.push({ path: '/in-game-view/', query: { game: name } })
}
</script>