<template>
  <div class="flex flex-col items-center gap-6 w-full max-w-2xl mx-auto p-6">
    <!-- Código de sala -->
    <div class="text-center">
      <p class="text-white/60 text-sm mb-1">
        Código de sala
      </p>
      <div class="flex items-center gap-3">
        <span class="text-yellow-400 text-5xl font-black tracking-widest">{{ mp.roomCode }}</span>
        <button
          class="bg-white/10 hover:bg-white/20 text-white text-xs font-medium px-3 py-1 rounded-lg transition-all"
          @click="copyCode"
        >
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
      <transition-group
        name="player-list"
        tag="ul"
        class="flex flex-col gap-2"
      >
        <li
          v-for="player in mp.players"
          :key="player.userId"
          class="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3"
        >
          <span class="text-yellow-400 text-lg font-bold">{{ player.isHost ? '👑' : '🎮' }}</span>
          <span class="text-white font-medium flex-1">{{ player.username }}</span>
          <span
            v-if="player.isHost"
            class="text-yellow-400/80 text-xs font-semibold uppercase tracking-wide"
          >Host</span>
        </li>
      </transition-group>
    </div>

    <!-- Personajes en fila horizontal -->
    <div class="w-full overflow-x-auto">
      <div class="flex flex-row gap-4 justify-center min-w-max mx-auto px-2">
        <div
          v-for="player in mp.players"
          :key="player.userId"
          class="flex flex-col items-center gap-2"
        >
          <div class="bg-indigo-950/40 rounded-2xl p-4 flex items-center justify-center w-64 h-64">
            <Character :user-id="player.userId" />
          </div>
          <span class="text-white font-medium text-sm bg-indigo-900/40 px-3 py-1 rounded-xl text-center max-w-28 truncate">
            {{ player.username }}
          </span>
        </div>
      </div>
    </div>

    <!-- Esperando... -->
    <p
      v-if="!mp.isHost"
      class="text-white/50 text-sm animate-pulse"
    >
      Esperando a que el host inicie la partida…
    </p>

    <!-- Botón iniciar (solo host) -->
    <button
      v-if="mp.isHost"
      :disabled="mp.players.length < 1"
      class="w-full bg-green-500 hover:bg-green-400 cursor-pointer disabled:bg-green-900 disabled:cursor-not-allowed text-white font-bold py-4 rounded-2xl text-lg transition-all"
      @click="mp.startGame()"
    >
      ¡Iniciar partida! ({{ mp.players.length }} jugador{{ mp.players.length !== 1 ? 'es' : '' }})
    </button>

    <!-- Abandonar -->
    <button
      class="text-red-400/70 cursor-pointer hover:text-red-400 text-sm transition-colors"
      @click="mp.leaveRoom()"
    >
      Abandonar sala
    </button>
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
