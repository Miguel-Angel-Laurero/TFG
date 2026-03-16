<template>
    <section class="flex justify-center">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            <GameCard
                v-for="minigame in minigames"
                :key="minigame.id"
                class="flex flex-col w-64 h-96 cursor-pointer"
                @click="goToGame(minigame.name)"
            >
                <p>{{ minigame.name }}</p>
            </GameCard>
        </div>
    </section>
</template>
<script setup>
import GameCard from './GameCard.vue'
import { useRouter } from 'vue-router'
const router = useRouter()
const minigames = [
  { id: "1", name: "quiz" },
  { id: "2", name: "flashcards" }
]
function goToGame(name) {
  router.push({ path: '/in-game-view/', query: { game: name } })
}
</script>