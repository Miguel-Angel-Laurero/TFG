<template>
  <div class="min-h-screen flex flex-col bg-gray-900">
    <!-- H8: cabecera mínima sin menú (acceso sin cuenta) -->
    <header class="bg-gray-900/80 backdrop-blur border-b border-white/5 px-4 py-3 flex flex-wrap items-center gap-2 sm:gap-3">
      <span class="text-white font-black text-lg tracking-tight">LudoScript</span>
      <span class="text-slate-500 text-xs">· Modo espectador</span>
      <span
        v-if="store.roomCode"
        class="ml-auto font-mono text-xs bg-gray-800 border border-white/10 text-green-300 px-3 py-1 rounded-lg"
      >
        Sala: {{ store.roomCode }}
      </span>
    </header>

    <main class="flex-grow flex flex-col items-center justify-center px-4 py-8">
      <!-- H1: cargando / conectando -->
      <div
        v-if="store.loading"
        class="flex flex-col items-center gap-4 text-center"
      >
        <i class="pi pi-spin pi-spinner text-4xl text-indigo-400" />
        <p class="text-slate-300 font-medium">
          Conectando a la partida…
        </p>
        <p class="text-slate-500 text-sm">
          Sala: {{ routeCode }}
        </p>
      </div>

      <!-- H9: error con mensaje humano y opción de reintentar -->
      <div
        v-else-if="store.error"
        class="max-w-sm w-full text-center"
      >
        <div class="bg-red-900/30 border border-red-500/30 rounded-2xl p-6">
          <i class="pi pi-exclamation-circle text-red-400 text-3xl mb-3 block" />
          <p class="text-red-200 font-semibold mb-1">
            No se pudo ver la partida
          </p>
          <p class="text-red-400/70 text-sm mb-4">
            {{ store.error }}
          </p>
          <button
            class="bg-red-700/40 hover:bg-red-700/60 text-red-200 text-sm font-medium px-5 py-2 rounded-xl transition-all"
            @click="retry"
          >
            Reintentar
          </button>
        </div>
      </div>

      <!-- Sala cerrada -->
      <div
        v-else-if="store.gameStatus === 'closed'"
        class="text-center"
      >
        <p class="text-slate-300 text-xl font-bold mb-2">
          La sala ha sido cerrada
        </p>
        <p class="text-slate-500 text-sm">
          El profesor ha terminado la sesión.
        </p>
      </div>

      <!-- ── LOBBY: esperando inicio ── -->
      <div
        v-else-if="store.gameStatus === 'lobby' || store.gameStatus === 'idle'"
        class="w-full max-w-2xl"
      >
        <div class="text-center mb-8">
          <i class="pi pi-hourglass text-4xl text-indigo-400 mb-3 block" />
          <h1 class="text-white text-2xl font-bold mb-1">
            Esperando que la partida comience
          </h1>
          <p class="text-slate-400 text-sm">
            El profesor iniciará la partida en breve.
          </p>
        </div>
        <!-- Lista de jugadores en lobby -->
        <div
          v-if="store.scores.length"
          class="bg-gray-800/60 rounded-2xl p-4 border border-white/5"
        >
          <p class="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
            Jugadores ({{ store.scores.length }})
          </p>
          <div class="grid grid-cols-2 sm:grid-cols-3 gap-2">
            <div
              v-for="p in store.scores"
              :key="p.userId"
              class="flex items-center gap-2 bg-gray-700/50 rounded-xl px-3 py-2"
            >
              <span class="w-2 h-2 rounded-full bg-green-400 shrink-0" />
              <span class="text-white text-sm truncate">{{ p.username }}</span>
              <span
                v-if="p.isHost"
                class="ml-auto text-xs text-yellow-400"
              >👑</span>
            </div>
          </div>
        </div>
      </div>

      <!-- ── PLAYING: pregunta actual + ranking ── -->
      <div
        v-else-if="store.gameStatus === 'playing'"
        class="w-full max-w-5xl"
      >
        <div class="flex flex-col lg:flex-row gap-6">
          <!-- Columna izquierda: pregunta -->
          <div class="flex-grow">
            <div
              v-if="store.currentQuestion"
              class="flex flex-col gap-4"
            >
              <!-- Progreso + timer -->
              <div class="flex items-center justify-between">
                <span class="text-slate-400 text-sm">
                  Pregunta {{ (store.currentQuestion.questionIndex ?? 0) + 1 }}
                  de {{ store.currentQuestion.totalQuestions }}
                </span>
                <!-- H1: timer visual -->
                <div class="flex items-center gap-2">
                  <div class="w-24 bg-gray-700 rounded-full h-2">
                    <div
                      class="bg-indigo-500 h-2 rounded-full transition-all duration-1000"
                      :style="{ width: timerPercent + '%' }"
                    />
                  </div>
                  <span
                    :class="store.timerRemaining <= 5 ? 'text-red-400' : 'text-slate-300'"
                    class="font-mono text-sm font-bold w-6 text-right"
                  >
                    {{ store.timerRemaining }}
                  </span>
                </div>
              </div>

              <!-- Categoría y dificultad -->
              <div class="flex items-center gap-2 flex-wrap">
                <span class="text-xs bg-indigo-900/40 border border-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-lg">
                  {{ formatCategory(store.currentQuestion.category) }}
                </span>
                <span
                  v-if="store.currentQuestion.difficulty"
                  class="text-xs bg-gray-700/60 border border-white/5 text-slate-400 px-2 py-0.5 rounded-lg"
                >
                  {{ store.currentQuestion.difficulty }}
                </span>
              </div>

              <!-- Enunciado -->
              <div class="bg-gray-800/80 border border-white/5 rounded-2xl p-5">
                <p class="text-white text-lg font-medium leading-relaxed">
                  {{ store.currentQuestion.question }}
                </p>
              </div>

              <!-- Opciones (read-only) -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div
                  v-for="(opt, idx) in store.currentQuestion.options"
                  :key="idx"
                  :class="optionClass(idx)"
                  class="rounded-xl px-4 py-3 text-sm font-medium border transition-all"
                >
                  <span class="font-bold mr-2 opacity-60">{{ ['A','B','C','D'][idx] }}</span>
                  {{ opt }}
                  <!-- H1: mostrar correcta después del reveal -->
                  <span
                    v-if="store.revealedCorrectIndex === idx"
                    class="ml-2"
                  >✓</span>
                </div>
              </div>

              <!-- Explicación tras reveal -->
              <transition name="fade">
                <div
                  v-if="store.lastExplanation && store.revealedCorrectIndex !== null"
                  class="bg-indigo-900/20 border border-indigo-500/20 rounded-xl p-4 text-sm text-indigo-200"
                >
                  <i class="pi pi-info-circle mr-2 text-indigo-400" />
                  {{ store.lastExplanation }}
                </div>
              </transition>
            </div>

            <!-- H1: skeleton si no hay pregunta aún -->
            <div
              v-else
              class="space-y-4"
            >
              <div class="h-8 bg-gray-700/50 rounded-xl animate-pulse" />
              <div class="h-24 bg-gray-700/50 rounded-2xl animate-pulse" />
              <div class="grid grid-cols-2 gap-3">
                <div
                  v-for="i in 4"
                  :key="i"
                  class="h-12 bg-gray-700/50 rounded-xl animate-pulse"
                />
              </div>
            </div>
          </div>

          <!-- Columna derecha: ranking en tiempo real -->
          <div class="lg:w-64 shrink-0">
            <div class="bg-gray-800/60 border border-white/5 rounded-2xl p-4 sticky top-4">
              <p class="text-slate-400 text-xs font-medium uppercase tracking-wider mb-3">
                Clasificación
              </p>
              <div class="space-y-2">
                <div
                  v-for="(p, i) in sortedScores"
                  :key="p.userId"
                  class="flex items-center gap-2"
                >
                  <span class="text-slate-500 text-xs w-4 shrink-0">{{ i + 1 }}</span>
                  <span class="flex-1 text-white text-sm truncate">{{ p.username }}</span>
                  <span class="text-yellow-300 text-xs font-bold font-mono">
                    {{ p.score.toLocaleString() }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- ── FINISHED: ranking final ── -->
      <div
        v-else-if="store.gameStatus === 'finished'"
        class="w-full max-w-lg text-center"
      >
        <h1 class="text-white text-3xl font-black mb-2">
          ¡Partida terminada!
        </h1>
        <p class="text-slate-400 text-sm mb-8">
          Resultados finales
        </p>

        <!-- Podio top 3 -->
        <div class="flex items-end justify-center gap-4 mb-8">
          <div
            v-for="(p, i) in podium"
            :key="p?.userId ?? i"
            :class="podiumHeight(i)"
            class="flex flex-col items-center gap-2 bg-gray-800/60 border border-white/5 rounded-2xl px-4 py-3"
          >
            <span class="text-2xl">{{ ['🥇','🥈','🥉'][i] }}</span>
            <span class="text-white font-bold text-sm truncate max-w-[80px]">{{ p?.username ?? '—' }}</span>
            <span class="text-yellow-300 font-mono text-xs">{{ p?.score?.toLocaleString() ?? 0 }}</span>
          </div>
        </div>

        <!-- Lista completa -->
        <div class="bg-gray-800/60 border border-white/5 rounded-2xl overflow-hidden">
          <div
            v-for="(p, i) in store.finalRanking"
            :key="p.userId"
            class="flex items-center gap-3 px-4 py-2.5 border-b border-white/5 last:border-0"
          >
            <span class="text-slate-500 text-sm w-5">{{ i + 1 }}</span>
            <span class="flex-1 text-white text-sm">{{ p.username }}</span>
            <span class="text-yellow-300 font-mono text-sm font-bold">
              {{ p.score.toLocaleString() }} pts
            </span>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useSpectatorStore } from '@/stores/spectator.store';

const route = useRoute();
const store = useSpectatorStore();

const routeCode = computed(() => (route.params.code ?? '').toUpperCase());

const timerPercent = computed(() => {
    if (!store.timerTotal) return 0;
    return Math.max(0, (store.timerRemaining / store.timerTotal) * 100);
});

const sortedScores = computed(() =>
    [...store.scores].sort((a, b) => b.score - a.score)
);

// Top 3 siempre con 3 slots (rellena con null si hay menos jugadores)
const podium = computed(() => {
    const top = sortedScores.value.slice(0, 3);
    while (top.length < 3) top.push(null);
    return top;
});

function podiumHeight(i) {
    return ['order-2 pt-0', 'order-1 pt-4', 'order-3 pt-8'][i] ?? 'order-3 pt-8';
}

function formatCategory(cat) {
    if (!cat) return '';
    return cat.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function optionClass(idx) {
    const revealed = store.revealedCorrectIndex !== null;
    if (!revealed) {
        return 'bg-gray-800/60 border-white/10 text-white';
    }
    if (idx === store.revealedCorrectIndex) {
        return 'bg-green-900/40 border-green-500/50 text-green-200';
    }
    return 'bg-gray-800/30 border-white/5 text-slate-500';
}

function retry() {
    store.clearError();
    store.disconnect();
    store.joinAsSpectator(routeCode.value);
}

onMounted(() => {
    store.joinAsSpectator(routeCode.value);
});

onUnmounted(() => {
    store.disconnect();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
