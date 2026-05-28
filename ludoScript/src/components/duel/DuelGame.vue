<template>
  <div class="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto p-4">
    <!-- Cabecera: progreso y categoría -->
    <div class="w-full flex justify-between items-center text-white/60 text-sm font-medium">
      <span>Pregunta {{ questionIndex + 1 }} / {{ duel.currentQuestion?.totalQuestions }}</span>
      <span class="uppercase tracking-wide text-xs">
        {{ duel.currentQuestion?.category?.replace(/-/g, ' ') }}
      </span>
    </div>

    <!-- Barra de tiempo -->
    <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
      <div
        class="h-full rounded-full transition-all duration-1000"
        :class="timerBarColor"
        :style="{ width: timerPercent + '%' }"
      />
    </div>
    <div
      class="text-white font-black text-4xl tabular-nums"
      :class="timerTextColor"
    >
      {{ duel.timerRemaining }}
    </div>

    <!-- Pregunta -->
    <h2 class="text-white text-xl sm:text-2xl font-bold text-center leading-snug px-2">
      {{ duel.currentQuestion?.question }}
    </h2>

    <!-- Opciones -->
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
      <button
        v-for="(option, idx) in duel.currentQuestion?.options"
        :key="idx"
        :disabled="duel.hasAnswered || duel.timerRemaining === 0"
        class="text-left px-5 py-4 rounded-2xl border-2 font-medium text-white transition-all duration-200"
        :class="optionClass(idx)"
        @click="handleAnswer(idx)"
      >
        <span class="font-black mr-2 opacity-60">{{ LABELS[idx] }}.</span>
        {{ option }}
      </button>
    </div>

    <!-- Feedback de la respuesta propia -->
    <transition name="fade">
      <div
        v-if="duel.lastAnswerResult"
        class="w-full rounded-2xl px-5 py-4 text-center"
        :class="duel.lastAnswerResult.correct
          ? 'bg-emerald-500/20 border border-emerald-400'
          : 'bg-red-500/20 border border-red-400'"
      >
        <p
          class="font-bold text-lg"
          :class="duel.lastAnswerResult.correct ? 'text-emerald-300' : 'text-red-300'"
        >
          {{ duel.lastAnswerResult.correct ? '¡Correcto!' : 'Incorrecto' }}
        </p>
        <p
          v-if="duel.lastAnswerResult.correct"
          class="text-white/70 text-sm mt-1"
        >
          +{{ duel.lastAnswerResult.pointsEarned }} puntos
        </p>
        <p class="text-white/50 text-xs mt-1">
          Total: {{ duel.lastAnswerResult.totalScore }} pts
        </p>
      </div>
    </transition>

    <!-- Respuesta correcta cuando se agota el tiempo sin responder -->
    <transition name="fade">
      <div
        v-if="duel.lastQuestionEnd && !duel.lastAnswerResult"
        class="w-full bg-white/5 rounded-2xl px-5 py-4 text-center"
      >
        <p class="text-white/60 text-sm">
          Respuesta correcta:
        </p>
        <p class="text-yellow-300 font-bold text-lg mt-1">
          {{ duel.currentQuestion?.options?.[duel.lastQuestionEnd.correctIndex] }}
        </p>
      </div>
    </transition>

    <!-- Marcador en tiempo real -->
    <div class="w-full bg-white/5 rounded-2xl p-4">
      <h4 class="text-white/60 text-xs uppercase tracking-wide mb-2">
        Marcador
      </h4>
      <ol class="flex flex-col gap-1">
        <li
          v-for="(p, i) in sortedPlayers"
          :key="p.userId"
          class="flex items-center gap-3 rounded-xl px-2 py-1 text-sm"
          :class="isCurrentUser(p) ? 'bg-cyan-400/10 ring-1 ring-inset ring-cyan-300/25' : ''"
        >
          <span
            class="w-4 text-right"
            :class="isCurrentUser(p) ? 'text-cyan-200' : 'text-white/40'"
          >
            {{ i + 1 }}
          </span>
          <span
            class="flex-1 font-medium"
            :class="isCurrentUser(p) ? 'text-cyan-100 font-semibold' : 'text-white'"
          >
            {{ p.username }}
          </span>
          <span
            v-if="isCurrentUser(p)"
            class="rounded-full border border-cyan-300/40 bg-cyan-400/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-cyan-200"
          >
            Tú
          </span>
          <span
            class="font-bold"
            :class="isCurrentUser(p) ? 'text-cyan-200' : 'text-yellow-400'"
          >
            {{ p.score }}
          </span>
        </li>
      </ol>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'
import { useDuelStore } from '@/stores/duel.store'

const auth = useAuthStore()
const duel = useDuelStore()
const LABELS = ['A', 'B', 'C', 'D']

const questionIndex = computed(() => duel.currentQuestion?.questionIndex ?? 0)

const timerPercent = computed(() => {
    if (!duel.timerTotal) return 0
    return (duel.timerRemaining / duel.timerTotal) * 100
})

const timerBarColor = computed(() => {
    if (timerPercent.value > 50) return 'bg-emerald-400'
    if (timerPercent.value > 25) return 'bg-yellow-400'
    return 'bg-red-400'
})

const timerTextColor = computed(() => {
    if (timerPercent.value > 50) return 'text-emerald-300'
    if (timerPercent.value > 25) return 'text-yellow-300'
    return 'text-red-300'
})

const sortedPlayers = computed(() =>
    [...duel.players].sort((a, b) => b.score - a.score)
)

function isCurrentUser(player) {
    return Number(player?.userId) === Number(auth.user?.id)
}

function optionClass(idx) {
    const answered = duel.hasAnswered || duel.timerRemaining === 0
    const result = duel.lastAnswerResult

    if (!answered) return 'border-white/10 bg-white/5 hover:bg-white/10 hover:border-indigo-400 cursor-pointer'
    if (result) {
        if (idx === result.correctIndex) return 'border-emerald-500 bg-emerald-500/15 cursor-default'
        if (idx !== result.correctIndex && !result.correct && idx === result.chosenIndex)
            return 'border-red-500 bg-red-500/15 cursor-default'
    }
    return 'border-white/10 bg-white/5 opacity-50 cursor-default'
}

function handleAnswer(idx) {
    duel.sendAnswer(idx)
}
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
