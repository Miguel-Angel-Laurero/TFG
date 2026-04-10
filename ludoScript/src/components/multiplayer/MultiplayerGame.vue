<template>
    <div class="flex flex-col items-center gap-6 w-full max-w-3xl mx-auto p-4">

        <!-- Header de pregunta -->
        <div class="w-full flex justify-between items-center text-white/60 text-sm font-medium">
            <span>Pregunta {{ questionIndex + 1 }} / {{ mp.currentQuestion?.totalQuestions }}</span>
            <span class="uppercase tracking-wide text-xs">{{ mp.currentQuestion?.category?.replace(/-/g, ' ') }}</span>
        </div>

        <!-- Barra de timer -->
        <div class="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div class="h-full rounded-full transition-all duration-1000" :class="timerBarColor"
                :style="{ width: timerPercent + '%' }" />
        </div>
        <div class="text-white font-black text-4xl tabular-nums" :class="timerTextColor">
            {{ mp.timerRemaining }}
        </div>

        <!-- Enunciado -->
        <h2 class="text-white text-xl sm:text-2xl font-bold text-center leading-snug px-2">
            {{ mp.currentQuestion?.question }}
        </h2>

        <!-- Opciones -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
            <button v-for="(option, idx) in mp.currentQuestion?.options" :key="idx"
                :disabled="mp.hasAnswered || mp.timerRemaining === 0" @click="handleAnswer(idx)"
                class="text-left px-5 py-4 rounded-2xl border-2 font-medium text-white transition-all duration-200"
                :class="optionClass(idx)">
                <span class="font-black mr-2 opacity-60">{{ LABELS[idx] }}.</span>
                {{ option }}
            </button>
        </div>

        <!-- Feedback de respuesta propia -->
        <transition name="fade">
            <div v-if="mp.lastAnswerResult" class="w-full rounded-2xl px-5 py-4 text-center"
                :class="mp.lastAnswerResult.correct ? 'bg-emerald-500/20 border border-emerald-400' : 'bg-red-500/20 border border-red-400'">
                <p class="font-bold text-lg" :class="mp.lastAnswerResult.correct ? 'text-emerald-300' : 'text-red-300'">
                    {{ mp.lastAnswerResult.correct ? '¡Correcto! 🎉' : 'Incorrecto 😞' }}
                </p>
                <p v-if="mp.lastAnswerResult.correct" class="text-white/70 text-sm mt-1">
                    +{{ mp.lastAnswerResult.pointsEarned }} puntos
                </p>
                <p class="text-white/50 text-xs mt-1">Total: {{ mp.lastAnswerResult.totalScore }} pts</p>
            </div>
        </transition>

        <!-- Resultado de pregunta (para todos cuando termina el tiempo) -->
        <transition name="fade">
            <div v-if="mp.lastQuestionEnd && !mp.lastAnswerResult"
                class="w-full bg-white/5 rounded-2xl px-5 py-4 text-center">
                <p class="text-white/60 text-sm">Respuesta correcta:</p>
                <p class="text-yellow-300 font-bold text-lg mt-1">
                    {{ mp.currentQuestion?.options?.[mp.lastQuestionEnd.correctIndex] }}
                </p>
            </div>
        </transition>

        <!-- Mini ranking lateral -->
        <div class="w-full bg-white/5 rounded-2xl p-4">
            <h4 class="text-white/60 text-xs uppercase tracking-wide mb-2">Clasificación</h4>
            <ol class="flex flex-col gap-1">
                <li v-for="(p, i) in sortedPlayers" :key="p.userId" class="flex items-center gap-3 text-sm">
                    <span class="text-white/40 w-4 text-right">{{ i + 1 }}</span>
                    <span class="text-white font-medium flex-1">{{ p.username }}</span>
                    <span class="text-yellow-400 font-bold">{{ p.score }}</span>
                </li>
            </ol>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import { useMultiplayerStore } from '@/stores/multiplayer.store'

const mp = useMultiplayerStore()
const LABELS = ['A', 'B', 'C', 'D']

const questionIndex = computed(() => mp.currentQuestion?.questionIndex ?? 0)

const timerPercent = computed(() => {
    if (!mp.timerTotal) return 0
    return (mp.timerRemaining / mp.timerTotal) * 100
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
    [...mp.players].sort((a, b) => b.score - a.score)
)

function optionClass(idx) {
    const end = mp.lastQuestionEnd
    const result = mp.lastAnswerResult

    if (!end && !result) {
        // Antes de responder
        return 'border-white/20 bg-white/5 hover:bg-white/15 hover:border-white/40 cursor-pointer'
    }

    // Revelar respuesta correcta cuando acabó el tiempo (lastQuestionEnd)
    if (end) {
        if (idx === end.correctIndex) return 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
        return 'border-white/10 bg-white/5 opacity-50'
    }

    // Feedback inmediato tras responder (lastAnswerResult)
    if (result) {
        const isCorrect = idx === result.correctIndex
        if (isCorrect) return 'border-emerald-400 bg-emerald-500/20 text-emerald-200'
        return 'border-white/10 bg-white/5 opacity-40 cursor-not-allowed'
    }

    return 'border-white/20 bg-white/5'
}

function handleAnswer(idx) {
    mp.sendAnswer(idx)
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
    transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
    opacity: 0;
}
</style>
