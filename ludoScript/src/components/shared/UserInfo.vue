<template>
    <div class="h-full">
        <h2 class="text-2xl text-gray-50 font-bold mb-4">Tu Progreso</h2>

        <!-- Datos básicos del usuario -->
        <div class="flex items-center gap-4 mb-5 p-3 bg-slate-700/60 rounded-lg">
            <img v-if="auth.user?.avatar" :src="auth.user.avatar" alt="Avatar"
                class="w-14 h-14 rounded-full object-cover ring-2 ring-blue-400" />
            <div v-else
                class="w-14 h-14 rounded-full bg-slate-600 flex items-center justify-center ring-2 ring-blue-400">
                <span class="text-2xl text-gray-300">👤</span>
            </div>
            <div class="min-w-0">
                <p class="text-gray-50 font-semibold text-lg leading-tight truncate">{{ auth.user?.username }}</p>
                <p class="text-gray-400 text-sm truncate">{{ auth.user?.email }}</p>
            </div>
        </div>

        <div class="grid grid-cols-4 gap-4">
            <div class="text-center p-2 bg-blue-50 rounded-lg">
                <p class="text-3xl font-bold text-blue-600"> {{ auth.userData?.streak }}</p>
                <p class="text-gray-600 text-sm font-medium">Días de racha</p>
            </div>
            <div class="text-center p-2 bg-green-50 rounded-lg">
                <p class="text-3xl font-bold text-green-600">{{ totalGames }}</p>
                <p class="text-gray-600 text-sm font-medium">Tests completados</p>
            </div>
            <div class="text-center p-2 bg-purple-50 rounded-lg">
                <p class="text-3xl font-bold text-purple-600">{{ auth.userData?.coins }}</p>
                <p class="text-gray-600 text-sm font-medium">GB RAM</p>
            </div>
            <div class="text-center p-2 bg-orange-50 rounded-lg">
                <p class="text-3xl font-bold text-orange-600">{{ auth.userData?.accuracy }}%</p>
                <p class="text-gray-600 text-sm font-medium">Precisión</p>
            </div>
        </div>

        <!-- Estadísticas adicionales -->
        <div class="grid grid-cols-2 gap-4 mt-4">
            <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span class="text-2xl"></span>
                <div>
                    <p class="text-lg font-bold">{{ categoriesPlayed }} / 7</p>
                    <p class="text-sm text-gray-600">Categorías practicadas</p>
                </div>
            </div>
            <div class="flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <span class="text-2xl"></span>
                <div>
                    <p class="text-lg font-bold">{{ auth.userData?.timeSpent }} hrs</p>
                    <p class="text-sm text-gray-600">Tiempo de práctica</p>
                </div>
            </div>
        </div>
    </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { gameService } from '@/api/game.service'
import { categoryStatsService } from '@/api/categoryStats.service'

const auth = useAuthStore()
const totalGames = ref(0)
const categoriesPlayed = ref(0)

onMounted(async () => {
    // Asegurar que userData esté cargado (puede ser null si se navegó directo a /profile)
    if (!auth.userData) {
        await auth.fetchMe()
    }

    try {
        const { data } = await gameService.getMine()
        totalGames.value = data.filter(g => g.gameName === 'Quiz').length
    } catch (_) { /* fallo de red: se mantiene 0 */ }

    try {
        const { data } = await categoryStatsService.getAll()
        categoriesPlayed.value = data.filter(s => s.total > 0).length
    } catch (_) { /* fallo de red: se mantiene 0 */ }
})
</script>