<template>
    <section class="flex justify-center p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-6 w-full max-w-6xl">
            
            <RouterLink to="/shop-view/" class="col-span-full h-16 bg-emerald-400 rounded-xl p-4 font-bold text-lg text-gray-50 flex justify-center items-center">
                <span>Tienda</span>
                <i class="pi pi-shopping-bag px-4" style="font-size: 1.5rem"></i>    
            </RouterLink>

            <GameCard
                v-for="minigame in minigames"
                :key="minigame.id"
                class="flex flex-col w-full h-48 cursor-pointer"
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
  { id: "3", name: "Fix The Bug" },
  { id: "4", name: "Code Sorter" },
]
function goToGame(name) {
  router.push({ path: '/in-game-view/', query: { game: name } })
}
</script>