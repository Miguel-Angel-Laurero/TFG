<template>
  <div class="flex flex-col items-center gap-6 w-full max-w-xl mx-auto p-6">
    <h2 class="text-white text-3xl font-black">
      Partida finalizada
    </h2>
    <p class="text-white/60 text-sm">
      Clasificacion final
    </p>

    <div class="flex items-end justify-center gap-4 w-full my-2">
      <div
        v-if="mp.finalRanking[1]"
        class="flex flex-col items-center gap-1"
      >
        <span class="text-3xl">2</span>
        <span :class="podiumNameClass(mp.finalRanking[1], 'text-white font-bold text-sm')">
          {{ mp.finalRanking[1].username }}
        </span>
        <span class="text-white/60 text-xs">{{ mp.finalRanking[1].score }} pts</span>
      </div>
      <div
        v-if="mp.finalRanking[0]"
        class="flex flex-col items-center gap-1 scale-110"
      >
        <span class="text-4xl">1</span>
        <span :class="podiumNameClass(mp.finalRanking[0], 'text-yellow-300 font-black')">
          {{ mp.finalRanking[0].username }}
        </span>
        <span class="text-yellow-400/80 text-sm font-bold">{{ mp.finalRanking[0].score }} pts</span>
      </div>
      <div
        v-if="mp.finalRanking[2]"
        class="flex flex-col items-center gap-1"
      >
        <span class="text-3xl">3</span>
        <span :class="podiumNameClass(mp.finalRanking[2], 'text-white font-bold text-sm')">
          {{ mp.finalRanking[2].username }}
        </span>
        <span class="text-white/60 text-xs">{{ mp.finalRanking[2].score }} pts</span>
      </div>
    </div>

    <div class="w-full bg-white/5 rounded-2xl overflow-hidden">
      <table class="w-full">
        <thead>
          <tr class="text-white/40 text-xs uppercase tracking-wide border-b border-white/10">
            <th class="py-3 px-4 text-left w-10">
              #
            </th>
            <th class="py-3 px-4 text-left">
              Jugador
            </th>
            <th class="py-3 px-4 text-right">
              Puntos
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="(player, i) in mp.finalRanking"
            :key="player.userId"
            class="border-b border-white/5 last:border-0"
            :class="rowClass(player, i)"
          >
            <td
              class="py-3 px-4 font-bold"
              :class="isCurrentUser(player) ? 'text-cyan-200' : 'text-white/50'"
            >
              {{ i + 1 }}
            </td>
            <td class="py-3 px-4">
              <div class="flex items-center gap-2">
                <span
                  class="font-medium"
                  :class="nameClass(player)"
                >{{ player.username }}</span>
                <span
                  v-if="isCurrentUser(player)"
                  class="rounded-full border border-cyan-300/40 bg-cyan-400/15 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-cyan-200"
                >
                  Tu
                </span>
                <span
                  v-if="player.isHost"
                  class="text-yellow-400/70 text-xs"
                >host</span>
              </div>
            </td>
            <td class="py-3 px-4 text-right">
              <span
                class="font-black"
                :class="scoreClass(player, i)"
              >
                {{ player.score }}
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button
      class="w-full bg-white text-gray-900 font-bold py-3 rounded-xl hover:bg-gray-100 transition-all mt-2 cursor-pointer"
      @click="handleBack"
    >
      Volver al inicio
    </button>
  </div>
</template>

<script setup>
import { useAuthStore } from '@/stores/auth.store'
import { useMultiplayerStore } from '@/stores/multiplayer.store'
import { useRouter } from 'vue-router'

const auth = useAuthStore()
const mp = useMultiplayerStore()
const router = useRouter()

function isCurrentUser(player) {
    return Number(player?.userId) === Number(auth.user?.id)
}

function podiumNameClass(player, defaultClass) {
    return isCurrentUser(player)
        ? `${defaultClass} rounded-full border border-cyan-300/50 bg-cyan-400/15 px-3 py-1 text-cyan-100 shadow-[0_0_20px_rgba(34,211,238,0.18)]`
        : defaultClass
}

function rowClass(player, index) {
    if (isCurrentUser(player)) return 'bg-cyan-400/10 ring-1 ring-inset ring-cyan-300/25'
    if (index === 0) return 'bg-yellow-400/10'
    return ''
}

function nameClass(player) {
    return isCurrentUser(player) ? 'text-cyan-100 font-semibold' : 'text-white'
}

function scoreClass(player, index) {
    if (isCurrentUser(player)) return 'text-cyan-200 text-lg'
    if (index === 0) return 'text-yellow-300 text-lg'
    return 'text-white'
}

function handleBack() {
    mp.leaveRoom()
    router.push('/')
}
</script>
