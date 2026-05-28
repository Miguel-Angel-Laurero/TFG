<template>
  <div class="flex flex-col items-center justify-center gap-6 w-full max-w-sm mx-auto py-20 px-4 text-center">
    <div class="relative">
      <div class="w-20 h-20 rounded-full bg-indigo-900/40 border border-indigo-500/30 flex items-center justify-center mx-auto">
        <i class="pi pi-bolt text-yellow-400 text-4xl" />
      </div>
      <span class="absolute -top-1 -right-1 flex h-4 w-4">
        <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75" />
        <span class="relative inline-flex rounded-full h-4 w-4 bg-indigo-500" />
      </span>
    </div>

    <div>
      <h2 class="text-white font-black text-2xl">
        Duelo 1v1
      </h2>
      <p class="text-slate-400 text-sm mt-1">
        {{ statusMessage }}
      </p>
    </div>

    <div
      v-if="duel.duelCode"
      class="bg-indigo-900/30 border border-indigo-500/20 rounded-2xl px-6 py-3"
    >
      <p class="text-slate-400 text-xs uppercase tracking-widest mb-1">
        Código de duelo
      </p>
      <p class="text-indigo-300 font-mono font-bold text-xl tracking-widest">
        {{ duel.duelCode }}
      </p>
    </div>

    <!-- Jugadores que han aceptado -->
    <div
      v-if="duel.players.length"
      class="w-full bg-white/5 rounded-2xl p-4 space-y-2"
    >
      <p class="text-slate-400 text-xs uppercase tracking-wide mb-2">
        Jugadores listos
      </p>
      <div
        v-for="p in duel.players"
        :key="p.userId"
        class="flex items-center gap-2 text-sm text-white px-2"
      >
        <i class="pi pi-check-circle text-emerald-400 text-xs" />
        {{ p.username }}
      </div>
    </div>

    <div class="flex items-center gap-2 text-slate-500 text-xs">
      <i class="pi pi-spin pi-spinner" />
      <span>Esperando jugadores…</span>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useDuelStore } from '@/stores/duel.store'

const duel = useDuelStore()

const statusMessage = computed(() => {
    if (duel.duelStatus === 'waiting') return 'Las invitaciones han sido enviadas. Esperando que ambos jugadores acepten.'
    if (duel.duelStatus === 'invited') return 'Has aceptado el duelo. Esperando al otro jugador…'
    return 'Preparando el duelo…'
})
</script>
