<template>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
        <h2 class="text-white font-semibold text-base mb-1">Resumen semanal</h2>
        <p class="text-white/50 text-xs mb-4">
            Progreso acumulado de las ultimas 7 sesiones de Quiz y Flashcards.
        </p>
        <div v-if="!hasWeekly" class="text-center py-6 text-white/40 text-sm">
            Sin actividad esta semana. Completa un Quiz para ver tu progreso.
        </div>
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <button v-for="cat in weeklyCategories" :key="cat.key"
                class="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 hover:border-white/25 hover:bg-white/10 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                :title="`${cat.label}: ${cat.percent}% esta semana (${cat.total} preguntas)`"
                :aria-label="`${cat.label}: ${cat.percent}% de aciertos esta semana.`" @click="goToReview(cat.key)">
                <div class="relative w-14 h-14">
                    <svg viewBox="0 0 44 44" class="w-full h-full -rotate-90">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="rgba(255,255,255,0.08)" stroke-width="4" />
                        <circle cx="22" cy="22" r="18" fill="none" :stroke="cat.color" stroke-width="4"
                            stroke-linecap="round" :stroke-dasharray="CIRCUMFERENCE"
                            :stroke-dashoffset="cat.total > 0 ? CIRCUMFERENCE * (1 - cat.percent / 100) : CIRCUMFERENCE"
                            class="transition-all duration-700" />
                    </svg>
                    <div class="absolute inset-0 flex items-center justify-center">
                        <span class="text-[10px] font-bold text-white">
                            {{ cat.total > 0 ? cat.percent + '%' : '-' }}
                        </span>
                    </div>
                </div>
                <span class="text-[11px] text-white/60 text-center leading-tight">
                    {{ cat.label }}
                </span>
            </button>
        </div>
        <div v-if="hasWeekly" class="mt-4 flex flex-wrap gap-3 text-xs text-white/50">
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>71-100 %
            </span>
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>41-70 %
            </span>
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-red-500 inline-block"></span>0-40 %
            </span>
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-zinc-600 inline-block"></span>Sin datos
            </span>
        </div>
    </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { QUIZ_CATEGORIES } from '@/utils/quizCategories'
const router = useRouter()
const LS_WEEKLY = 'ludoscript_weeklySessions'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000
const CIRCUMFERENCE = 2 * Math.PI * 18
const CATEGORIES = QUIZ_CATEGORIES
function masteryColor(correct, total) {
    if (total === 0) return '#374151'
    const pct = Math.round((correct / total) * 100)
    if (pct > 70) return '#22c55e'
    if (pct > 40) return '#f97316'
    return '#ef4444'
}
function toCategoryList(statsMap) {
    return CATEGORIES.map((cat) => {
        const s = statsMap[cat.key]
        const correct = s?.correct ?? 0
        const total = s?.total ?? 0
        return {
            ...cat,
            correct,
            total,
            percent: total > 0 ? Math.round((correct / total) * 100) : 0,
            color: masteryColor(correct, total),
        }
    })
}
const weeklySessions = (() => {
    try {
        const all = JSON.parse(localStorage.getItem(LS_WEEKLY) || '[]')
        const cutoff = Date.now() - ONE_WEEK_MS
        return all.filter((s) => s.timestamp > cutoff)
    } catch (_) {
        return []
    }
})()
const hasWeekly = weeklySessions.length > 0
const weeklyCategories = computed(() => {
    const agg = {}
    for (const session of weeklySessions) {
        for (const [cat, { correct, total }] of Object.entries(session.stats ?? {})) {
            if (!agg[cat]) agg[cat] = { correct: 0, total: 0 }
            agg[cat].correct += correct
            agg[cat].total += total
        }
    }
    return toCategoryList(agg)
})
function goToReview(categoryKey) {
    router.push({ path: '/category-review/', query: { category: categoryKey } })
}
</script>
