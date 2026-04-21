<template>
    <div class="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-6">
        <!-- Código de sala -->
        <div class="text-center">
            <p class="text-white/60 text-sm mb-1">Código de sala</p>
            <div class="flex items-center gap-3">
                <span class="text-yellow-400 text-5xl font-black tracking-widest">{{ mp.roomCode }}</span>
                <button @click="copyCode"
                    class="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-lg transition-all">
                    {{ copied ? '¡Copiado!' : 'Copiar' }}
                </button>
            </div>
        </div>

        <!-- Config -->
        <div class="flex gap-6 text-white/60 text-sm">
            <span>{{ mp.settings.questionCount }} preguntas</span>
            <span>{{ mp.settings.timePerQuestion }}s por pregunta</span>
        </div>

        <!-- Lista de jugadores -->
        <div class="w-full bg-white/5 rounded-2xl p-4">
            <h3 class="text-white/80 font-semibold mb-3">
                Jugadores ({{ mp.players.length }}/10)
            </h3>
            <transition-group name="player-list" tag="ul" class="flex flex-col gap-2">
                <li v-for="player in mp.players" :key="player.userId"
                    class="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3">
                    <span class="text-yellow-400 text-lg font-bold">{{ player.isHost ? '👑' : '🎮' }}</span>
                    <span class="text-white font-medium flex-1">{{ player.username }}</span>
                    <span v-if="player.isHost"
                        class="text-yellow-400/80 text-xs font-semibold uppercase tracking-wide">Host</span>
                </li>
            </transition-group>
        </div>
        
        <!-- Esperando... -->
        <p v-if="!mp.isHost" class="text-white/50 text-sm animate-pulse">
            Esperando a que el host inicie la partida…
        </p>
        
        <!-- Botón iniciar (solo host) -->
        <button v-if="mp.isHost" @click="mp.startGame()" :disabled="mp.players.length < 1"
        class="w-full bg-green-500 hover:bg-green-400 cursor-pointer disabled:bg-green-900 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg transition-all">
        ¡Iniciar partida! ({{ mp.players.length }} jugador{{ mp.players.length !== 1 ? 'es' : '' }})
    </button>
    
    <!-- Abandonar -->
    <button @click="mp.leaveRoom()" class="text-red-400/70 cursor-pointer hover:text-red-400 text-sm transition-colors">
        Abandonar sala
    </button>
</div>
<div 
  v-for="player in mp.players" 
  :key="player.userId"
  class="bg-indigo-950/40 w-full  "
>
    <div class="flex flex-col h-96 p-8  m-auto flex items-center justify-center rounded-2xl">
        <Character :user-id="player.userId"/>
        <span class="flex text-white font-medium bg-indigo-900/40 p-4 rounded-2xl">{{ player.username }}</span>
    </div>
</div>
</template>

<script setup>
import { ref } from 'vue'
import { useMultiplayerStore } from '@/stores/multiplayer.store'
import Character from '../profile/Character.vue'

const mp = useMultiplayerStore()
const copied = ref(false)

function copyCode() {
    navigator.clipboard.writeText(mp.roomCode)
    copied.value = true
    setTimeout(() => { copied.value = false }, 2000)
}
</script>

<style scoped>
.player-list-enter-active,
.player-list-leave-active {
    transition: all 0.3s ease;
}

.player-list-enter-from,
.player-list-leave-to {
    opacity: 0;
    transform: translateX(-20px);
}
</style>
