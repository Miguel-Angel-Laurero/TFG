<template>
    <div class="flex flex-col items-center gap-6 w-full max-w-xl mx-auto p-6">
        <h2 class="text-white text-3xl font-black">¡Partida finalizada!</h2>
        <p class="text-white/60 text-sm">Clasificación final</p>

        <!-- Podio top 3 -->
        <div class="flex items-end justify-center gap-4 w-full my-2">
            <div v-if="mp.finalRanking[1]" class="flex flex-col items-center gap-1">
                <span class="text-3xl">🥈</span>
                <span class="text-white font-bold text-sm">{{ mp.finalRanking[1].username }}</span>
                <span class="text-white/60 text-xs">{{ mp.finalRanking[1].score }} pts</span>
            </div>
            <div v-if="mp.finalRanking[0]" class="flex flex-col items-center gap-1 scale-110">
                <span class="text-4xl">🏆</span>
                <span class="text-yellow-300 font-black">{{ mp.finalRanking[0].username }}</span>
                <span class="text-yellow-400/80 text-sm font-bold">{{ mp.finalRanking[0].score }} pts</span>
            </div>
            <div v-if="mp.finalRanking[2]" class="flex flex-col items-center gap-1">
                <span class="text-3xl">🥉</span>
                <span class="text-white font-bold text-sm">{{ mp.finalRanking[2].username }}</span>
                <span class="text-white/60 text-xs">{{ mp.finalRanking[2].score }} pts</span>
            </div>
        </div>

        <!-- Tabla completa -->
        <div class="w-full bg-white/5 rounded-2xl overflow-hidden">
            <table class="w-full">
                <thead>
                    <tr class="text-white/40 text-xs uppercase tracking-wide border-b border-white/10">
                        <th class="py-3 px-4 text-left w-10">#</th>
                        <th class="py-3 px-4 text-left">Jugador</th>
                        <th class="py-3 px-4 text-right">Puntos</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="(player, i) in mp.finalRanking" :key="player.userId"
                        class="border-b border-white/5 last:border-0" :class="{ 'bg-yellow-400/10': i === 0 }">
                        <td class="py-3 px-4 text-white/50 font-bold">{{ i + 1 }}</td>
                        <td class="py-3 px-4">
                            <div class="flex items-center gap-2">
                                <span class="text-white font-medium">{{ player.username }}</span>
                                <span v-if="player.isHost" class="text-yellow-400/70 text-xs">host</span>
                            </div>
                        </td>
                        <td class="py-3 px-4 text-right">
                            <span class="font-black" :class="i === 0 ? 'text-yellow-300 text-lg' : 'text-white'">
                                {{ player.score }}
                            </span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>

        <button @click="handleBack"
            class="w-full bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all mt-2">
            Volver al inicio
        </button>
    </div>
</template>

<script setup>
import { useMultiplayerStore } from '@/stores/multiplayer.store'
import { useRouter } from 'vue-router'

const mp = useMultiplayerStore()
const router = useRouter()

function handleBack() {
    mp.leaveRoom()
    router.push('/')
}
</script>
