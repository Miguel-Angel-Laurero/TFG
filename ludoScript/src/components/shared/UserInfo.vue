<template>
    <div class="h-full ">
        <h2 class="text-2xl text-white font-bold">Tu Progreso</h2>
        <p class="text-xs text-indigo-300/50 mt-1 p-4">Progreso general del usuario</p>
        <div class="grid grid-cols-1 gap-4">
            <div class="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-4 transition-all duration-300">
                <p class="text-[10px] uppercase font-black text-indigo-300/40 tracking-widest mb-2">Dias de racha</p>
                <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{{ auth.userData?.streak }}</p>
            </div>
            <div class="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-4 transition-all duration-300">
                <p class="text-[10px] uppercase font-black text-indigo-300/40 tracking-widest mb-2">Tests completados</p>
                <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{{ totalGames }}</p>
            </div>
            <div class="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-4 transition-all duration-300">
                <p class="text-[10px] uppercase font-black text-indigo-300/40 tracking-widest mb-2">Monedas actuales</p>
                <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{{ auth.userData?.coins }}</p>
            </div>
            <div class="bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-4 transition-all duration-300">  
                <p class="text-[10px] uppercase font-black text-indigo-300/40 tracking-widest mb-2">Categorias practicadas</p>
                <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">{{ categoriesPlayed }}  / {{ totalCategoryCount }}</p>
            </div>
        </div>
    </div>
</template>
<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { gameService } from '@/api/game.service'
import { categoryStatsService } from '@/api/categoryStats.service'
import { QUIZ_CATEGORIES } from '@/utils/quizCategories'

const auth = useAuthStore()
const totalGames = ref(0)
const categoriesPlayed = ref(0)
const totalCategoryCount = QUIZ_CATEGORIES.length

onMounted(async () => {
    if (!auth.userData) {
        await auth.fetchMe()
    }

    try {
        const { data } = await gameService.getMine()
        totalGames.value = data.filter(g => g.gameName === 'Quiz').length
    } catch (_) {}

    try {
        const { data } = await categoryStatsService.getAll()
        categoriesPlayed.value = data.filter(s => s.total > 0).length
    } catch (_) {}
})
</script>

