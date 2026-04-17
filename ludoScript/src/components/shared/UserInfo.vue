<template>
    <div class="h-full">
        <h2 class="text-2xl text-gray-50 font-bold">Tu Progreso</h2>
        <p class="text-xs text-white/40 mt-1">Progreso general del usuario</p>
        <div class="grid grid-cols-2 py-4 gap-4">
            <div class="text-center bg-white/[0.04] border border-white/[0.08] rounded-[14px] p-3.5">
                <p class="text-gray-600 text-sm font-medium">Dias de racha</p>
                <p class="text-3xl font-bold text-gray-50">{{ auth.userData?.streak }}</p>
            </div>
            <div class="text-center bg-white/[0.04] border border-white/[0.08] rounded-[14px] p-3.5">
                <p class="text-gray-600 text-sm font-medium">Tests completados</p>
                <p class="text-3xl font-bold text-gray-50">{{ totalGames }}</p>
            </div>
            <div class="text-center bg-white/[0.04] border border-white/[0.08] rounded-[14px] p-3.5">
                <p class="text-gray-600 text-sm font-medium">Monedas actuales</p>
                <p class="text-3xl font-bold text-gray-50">{{ auth.userData?.coins }}</p>
            </div>
            <div class="text-center bg-white/[0.04] border border-white/[0.08] rounded-[14px] p-3.5">  
                <p class="text-sm text-gray-600 font-medium">Categorias practicadas</p>
                <p class="text-3xl font-bold text-gray-50">{{ categoriesPlayed }}  / {{ totalCategoryCount }}</p>
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

