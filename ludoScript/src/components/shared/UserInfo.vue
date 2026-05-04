<template>
    <div class="h-full">
        <h2 class="text-xl sm:text-2xl text-white font-bold">Tu Progreso</h2>
        <p class="text-xs text-indigo-300/60 mt-1 mb-4">
            Aquí puedes ver tu constancia, tests completados y recompensas.
        </p>

        <div class="grid grid-cols-2 md:grid-cols-1 gap-3">
            <div class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl md:rounded-3xl p-3 sm:p-4 transition-all duration-300">
                <p class="text-[10px] uppercase font-black text-indigo-300/50 tracking-widest mb-2">Racha</p>
                <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">
                    {{ auth.userData?.streak ?? 0 }}
                </p>
                <p class="text-[10px] text-white/35 mt-1.5 font-medium">días seguidos</p>
            </div>

            <div class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl md:rounded-3xl p-3 sm:p-4 transition-all duration-300">
                <p class="text-[10px] uppercase font-black text-indigo-300/50 tracking-widest mb-2">Tests</p>
                <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">
                    {{ totalGames }}
                </p>
                <p class="text-[10px] text-white/35 mt-1.5 font-medium">completados</p>
            </div>

            <div class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl md:rounded-3xl p-3 sm:p-4 transition-all duration-300">
                <p class="text-[10px] uppercase font-black text-indigo-300/50 tracking-widest mb-2">Monedas</p>
                <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">
                    {{ auth.userData?.coins ?? 0 }}
                </p>
                <p class="text-[10px] text-white/35 mt-1.5 font-medium">disponibles</p>
            </div>

            <div class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl md:rounded-3xl p-3 sm:p-4 transition-all duration-300">
                <p class="text-[10px] uppercase font-black text-indigo-300/50 tracking-widest mb-2">Categorías</p>
                <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">
                    {{ categoriesPlayed }}
                </p>
                <p class="text-[10px] text-white/35 mt-1.5 font-medium">practicadas</p>
            </div>
        </div>
    </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { gameService } from '@/api/game.service'
import { categoryStatsService } from '@/api/categoryStats.service'

const auth = useAuthStore()
const totalGames = ref(0)
const categoriesPlayed = ref(0)

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
