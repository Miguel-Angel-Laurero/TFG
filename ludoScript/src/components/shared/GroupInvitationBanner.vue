<template>
  <!-- Notificación persistente y visible en cualquier pantalla -->
  <transition name="slide-down">
    <div
      v-if="group.pendingGroupInvite"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
    >
      <div class="bg-gray-800 border border-green-500/40 rounded-2xl shadow-2xl p-5 pointer-events-auto">
        <div class="flex items-start gap-3">
          <!-- Icono reconocible para "grupo" -->
          <i class="pi pi-users text-green-400 text-xl mt-0.5 shrink-0" />

          <div class="flex-1 min-w-0">
            <p class="text-white font-bold text-sm leading-tight">
              ¡Partida de Clase!
            </p>
            <p class="text-slate-300 text-xs mt-0.5 leading-snug">
              <span class="font-semibold text-green-300">
                {{ group.pendingGroupInvite.initiatorUsername }}
              </span>
              ha iniciado una partida para el grupo
              <span class="text-indigo-300 font-medium">
                {{ group.pendingGroupInvite.groupName }}
              </span>.
            </p>

            <!-- Acciones con 1 click -->
            <div class="flex gap-2 mt-3">
              <button
                class="flex-1 bg-green-600 hover:bg-green-500 text-white text-xs font-bold py-2 rounded-xl transition-all"
                @click="handleAccept"
              >
                <i class="pi pi-check mr-1" />Aceptar
              </button>
              <button
                class="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-xl transition-all"
                @click="handleDecline"
              >
                Ignorar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useGroupStore } from '@/stores/group.store'
import { useMultiplayerStore } from '@/stores/multiplayer.store'
import { useRouter } from 'vue-router'

const group = useGroupStore()
const mp = useMultiplayerStore()
const router = useRouter()

function handleAccept() {
    const code = group.pendingGroupInvite?.code
    if (!code) return
    mp.joinRoom(code)
    group.dismissInvite()
    router.push('/multiplayer/')
}

function handleDecline() {
    group.dismissInvite()
}
</script>

<style scoped>
.slide-down-enter-active,
.slide-down-leave-active {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-down-enter-from,
.slide-down-leave-to {
    opacity: 0;
    transform: translateX(-50%) translateY(-16px);
}
</style>
