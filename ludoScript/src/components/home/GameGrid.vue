<template>
    <section class="flex justify-center p-6 h-full w-full">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 border-1 border-indigo-900 bg-gray-900/80 p-4 rounded-xl gap-6 w-full h-full">
            <GameCard
                v-for="minigame in minigames"
                :key="minigame.id"
                class="flex flex-col w-full h-full cursor-pointer hover:bg-yellow-400"
                @click="goToGame(minigame.name)"
            >
                <p>{{ minigame.name }}</p>
            </GameCard>
        </div>
    </section>
</template>
<script setup>
import 'primeicons/primeicons.css'
import GameCard from './GameCard.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const minigames = [
  { id: "1", name: "Quiz" },
  { id: "2", name: "Flashcards" },
  { id: "3", name: "FixTheBug" },
  { id: "4", name: "CodeSorter" },
]
function goToGame(name) {
  router.push({ path: '/in-game-view/', query: { game: name } })
}
</script>