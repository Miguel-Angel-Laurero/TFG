<template>
    <div class="flex flex-col gap-6">

        <!-- Ultima sesion -->
        <section>
            <h3 class="text-[11px] font-semibold text-blue-400/70 uppercase tracking-widest mb-2">
                Ultima sesion
            </h3>
            <div v-if="hasLastSession" class="grid grid-cols-2 gap-2">
                <button v-for="cat in lastSessionCategories" :key="cat.key"
                    class="aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-center transition-all hover:scale-105 hover:ring-2 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
                    :style="{ backgroundColor: cat.color }"
                    :title="`${cat.label}: ${cat.percent}% (${cat.total} intentos) - Ver errores`"
                    :aria-label="`${cat.label}: ${cat.percent}% de aciertos. Haz clic para ver los errores.`"
                    @click="goToReview(cat.key)">
                    <span class="text-[11px] font-bold text-white leading-tight">{{ cat.label }}</span>
                    <span v-if="cat.total > 0" class="text-[10px] text-white/75 mt-0.5">{{ cat.percent }}%</span>
                    <span v-else class="text-[10px] text-white/40 mt-0.5">sin datos</span>
                </button>
            </div>
            <p v-else class="text-[11px] text-gray-500 italic">Completa un Quiz para ver tu progreso.</p>
        </section>

        <!-- Resumen semanal -->
        <section>
            <h3 class="text-[11px] font-semibold text-blue-400/70 uppercase tracking-widest mb-2">
                Resumen semanal
            </h3>
            <div v-if="hasWeekly" class="grid grid-cols-2 gap-2">
                <button v-for="cat in weeklyCategories" :key="cat.key"
                    class="aspect-square rounded-lg flex flex-col items-center justify-center p-1 text-center transition-all hover:scale-105 hover:ring-2 hover:ring-white/40 focus:outline-none focus:ring-2 focus:ring-white/60"
                    :style="{ backgroundColor: cat.color }"
                    :title="`${cat.label}: ${cat.percent}% esta semana (${cat.total} preguntas)`"
                    :aria-label="`${cat.label}: ${cat.percent}% de aciertos esta semana.`" @click="goToReview(cat.key)">
                    <span class="text-[11px] font-bold text-white leading-tight">{{ cat.label }}</span>
                    <span v-if="cat.total > 0" class="text-[10px] text-white/75 mt-0.5">{{ cat.percent }}%</span>
                    <span v-else class="text-[10px] text-white/40 mt-0.5">sin datos</span>
                </button>
            </div>
            <p v-else class="text-[11px] text-gray-500 italic">Sin actividad esta semana.</p>
        </section>

        <!-- Leyenda compartida -->
        <section>
            <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Leyenda</p>
            <div class="flex flex-col gap-1">
                <div v-for="level in LEGEND" :key="level.label" class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-sm shrink-0" :style="{ backgroundColor: level.color }"></span>
                    <span class="text-[10px] text-gray-400">{{ level.label }}</span>
                </div>
            </div>
        </section>

    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const LS_LAST_SESSION = 'ludoscript_lastSession'
const LS_WEEKLY = 'ludoscript_weeklySessions'
const ONE_WEEK_MS = 7 * 24 * 60 * 60 * 1000

const CATEGORIES = [
    { key: 'tipos-coercion', label: 'Tipos y Coercion' },
    { key: 'arrays-metodos', label: 'Arrays' },
    { key: 'scope-variables', label: 'Scope' },
    { key: 'funciones', label: 'Funciones' },
    { key: 'asincronia', label: 'Asincronia' },
    { key: 'sintaxis-es6', label: 'ES6+' },
    { key: 'objetos', label: 'Objetos' },
]

const LEGEND = [
    { label: 'Sin datos', color: '#374151' },
    { label: 'Debil  (< 40%)', color: '#ef4444' },
    { label: 'Regular (40-60%)', color: '#f97316' },
    { label: 'Bien   (60-80%)', color: '#eab308' },
    { label: 'Fuerte (> 80%)', color: '#22c55e' },
]

function masteryColor(correct, total) {
    if (total === 0) return '#374151'
    const ratio = correct / total
    if (ratio >= 0.8) return '#22c55e'
    if (ratio >= 0.6) return '#eab308'
    if (ratio >= 0.4) return '#f97316'
    return '#ef4444'
}

function toCategoryList(statsMap) {
    return CATEGORIES.map(cat => {
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

// ── Last session ───────────────────────────────────────────────────────────
const lastSessionData = (() => {
    try { return JSON.parse(localStorage.getItem(LS_LAST_SESSION) || 'null') }
    catch (_) { return null }
})()

const hasLastSession = !!lastSessionData
const lastSessionCategories = computed(() =>
    toCategoryList(lastSessionData?.stats ?? {})
)

// ── Weekly aggregate ───────────────────────────────────────────────────────
const weeklySessions = (() => {
    try {
        const all = JSON.parse(localStorage.getItem(LS_WEEKLY) || '[]')
        const cutoff = Date.now() - ONE_WEEK_MS
        return all.filter(s => s.timestamp > cutoff)
    } catch (_) { return [] }
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

// ── Navigation ─────────────────────────────────────────────────────────────
function goToReview(categoryKey) {
    router.push({ path: '/category-review/', query: { category: categoryKey } })
}
</script>