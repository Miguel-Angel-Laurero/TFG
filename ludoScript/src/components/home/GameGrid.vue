<template>
    <section class="flex justify-center p-6 h-full w-full">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 bg-gray-200 p-4 rounded-xl gap-6 w-full">
            <GameCard
                v-for="minigame in minigames"
                :key="minigame.id"
                class="flex flex-col w-full h-full h-48 cursor-pointer hover:bg-green-300"
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