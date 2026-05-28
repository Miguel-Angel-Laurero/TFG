<template>
  <!-- H1: notificación persistente y visible en cualquier pantalla -->
  <transition name="slide-down">
    <div
      v-if="duel.pendingInvitation"
      class="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-4 pointer-events-none"
    >
      <div class="bg-gray-800 border border-yellow-500/40 rounded-2xl shadow-2xl p-5 pointer-events-auto">
        <div class="flex items-start gap-3">
          <!-- H2: icono reconocible para "duelo" -->
          <i class="pi pi-bolt text-yellow-400 text-xl mt-0.5 shrink-0" />

          <div class="flex-1 min-w-0">
            <p class="text-white font-bold text-sm leading-tight">
              ¡Duelo 1v1!
            </p>
            <p class="text-slate-300 text-xs mt-0.5 leading-snug">
              <!-- H2: información clara sobre quién invita y de qué trata -->
              <span class="font-semibold text-yellow-300">
                {{ duel.pendingInvitation.inviterUsername }}
              </span>
              te invita a competir en
              <span class="text-indigo-300 font-medium">
                {{ formatCategory(duel.pendingInvitation.category) }}
              </span>
              ({{ duel.pendingInvitation.questionCount }} preguntas).
            </p>

            <!-- H1: temporizador de la invitación -->
            <p class="text-slate-500 text-xs mt-1">
              <i class="pi pi-clock mr-0.5" />
              La invitación caduca en 60 s.
            </p>

            <!-- H7: acciones con 1 click -->
            <div class="flex gap-2 mt-3">
              <button
                class="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold py-2 rounded-xl transition-all"
                @click="handleAccept"
              >
                <i class="pi pi-check mr-1" />Aceptar
              </button>
              <button
                class="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-xs font-bold py-2 rounded-xl transition-all"
                @click="handleDecline"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </transition>
</template>

<script setup>
import { useDuelStore } from '@/stores/duel.store'
import { useRouter } from 'vue-router'

const duel = useDuelStore()
const router = useRouter()

function formatCategory(cat) {
    return cat?.replace(/-/g, ' ') ?? ''
}

function handleAccept() {
    const code = duel.pendingInvitation?.duelCode
    if (!code) return
    duel.acceptDuel(code)
    router.push('/duel-view/')
}

function handleDecline() {
    const code = duel.pendingInvitation?.duelCode
    if (!code) return
    duel.declineDuel(code)
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
