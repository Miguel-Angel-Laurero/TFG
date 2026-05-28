<template>
  <div class="h-screen flex flex-col bg-gray-900">
    <header>
      <Header />
    </header>

    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="w-full min-h-full p-4">
        <!-- H1: estado de carga inicial -->
        <div
          v-if="duel.duelStatus === 'idle'"
          class="flex flex-col items-center justify-center h-full py-20 text-center gap-4"
        >
          <i class="pi pi-spin pi-spinner text-4xl text-indigo-400" />
          <p class="text-slate-400 text-sm">
            Conectando al duelo…
          </p>
        </div>

        <!-- Duelo cancelado o error -->
        <div
          v-else-if="duel.duelStatus === 'cancelled'"
          class="flex flex-col items-center justify-center py-24 text-center gap-4 max-w-sm mx-auto"
        >
          <i class="pi pi-times-circle text-5xl text-red-400" />
          <h2 class="text-white font-bold text-xl">
            Duelo cancelado
          </h2>
          <!-- H9: mensaje de error legible -->
          <p class="text-slate-400 text-sm">
            {{ duel.error ?? 'El duelo fue cancelado.' }}
          </p>
          <button
            class="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold px-6 py-3 rounded-xl transition-all"
            @click="handleBack"
          >
            Volver a la clase
          </button>
        </div>

        <!-- Sala de espera -->
        <DuelWaiting v-else-if="isWaiting" />

        <!-- Partida en curso -->
        <DuelGame v-else-if="duel.duelStatus === 'playing'" />

        <!-- Resultados -->
        <DuelResults v-else-if="duel.duelStatus === 'finished'" />
      </div>
    </main>

    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useDuelStore } from '@/stores/duel.store'
import Header from '@/components/shared/Header.vue'
import Footer from '@/components/shared/Footer.vue'
import DuelWaiting from '@/components/duel/DuelWaiting.vue'
import DuelGame from '@/components/duel/DuelGame.vue'
import DuelResults from '@/components/duel/DuelResults.vue'

const duel = useDuelStore()
const router = useRouter()

// Mostrar la sala de espera en status 'waiting' o 'invited'
const isWaiting = computed(() =>
    duel.duelStatus === 'waiting' || duel.duelStatus === 'invited'
)

function handleBack() {
    duel.reset()
    router.push('/clase/')
}

onMounted(() => {
    // Guard: si llegamos aquí sin un duelo activo, volver a la clase
    if (duel.duelStatus === 'idle') {
        router.replace('/clase/')
    }
})
</script>
