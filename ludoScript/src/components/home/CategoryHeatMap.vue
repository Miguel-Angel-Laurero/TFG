<template>
    <div class="flex flex-col gap-6">

        <!-- Última sesión -->
        <section>
            <h3 class="text-[11px] font-semibold text-blue-400/70 uppercase tracking-widest mb-3">
                Última sesión
            </h3>
            <div v-if="hasLastSession" class="grid grid-cols-2 gap-3">
                <button v-for="cat in lastSessionCategories" :key="cat.key" class="flex flex-col items-center gap-1.5 p-2 rounded-xl
                           bg-slate-800/50 backdrop-blur-md border border-slate-700/40
                           hover:border-slate-500/60 hover:bg-slate-700/40
                           transition-all duration-200 focus:outline-none
                           focus:ring-2 focus:ring-indigo-500/50"
                    :title="`${cat.label}: ${cat.percent}% (${cat.total} intentos) — Ver errores`"
                    :aria-label="`${cat.label}: ${cat.percent}% de aciertos. Haz clic para ver los errores.`"
                    @click="goToReview(cat.key)">
                    <!-- Anillo SVG de progreso -->
                    <div class="relative w-11 h-11">
                        <svg viewBox="0 0 44 44" class="w-full h-full -rotate-90">
                            <!-- Track de fondo -->
                            <circle cx="22" cy="22" r="18" fill="none" stroke="#1e293b" stroke-width="4" />
                            <!-- Arco de progreso -->
                            <circle cx="22" cy="22" r="18" fill="none" :stroke="cat.color" stroke-width="4"
                                stroke-linecap="round" :stroke-dasharray="CIRCUMFERENCE" :stroke-dashoffset="cat.total > 0
                                    ? CIRCUMFERENCE * (1 - cat.percent / 100)
                                    : CIRCUMFERENCE" class="transition-all duration-700" />
                        </svg>
                        <!-- Porcentaje centrado -->
                        <div class="absolute inset-0 flex items-center justify-center">
                            <span class="text-[9px] font-bold text-white">
                                {{ cat.total > 0 ? cat.percent + '%' : '—' }}
                            </span>
                        </div>
                    </div>
                    <!-- Label de categoría -->
                    <span class="text-[10px] text-slate-400 text-center leading-tight">
                        {{ cat.label }}
                    </span>
                </button>
            </div>
            <p v-else class="text-[11px] text-gray-500 italic">
                Completa un Quiz para ver tu progreso.
            </p>
        </section>

        <!-- Leyenda -->
        <section>
            <p class="text-[10px] text-gray-500 uppercase tracking-wider mb-1.5">Leyenda</p>
            <div class="flex flex-col gap-1">
                <div v-for="level in LEGEND" :key="level.label" class="flex items-center gap-1.5">
                    <span class="w-3 h-3 rounded-full shrink-0" :style="{ backgroundColor: level.color }"></span>
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

const CATEGORIES = [
    { key: 'tipos-coercion', label: 'Tipos y Coercion' },
    { key: 'arrays-metodos', label: 'Arrays' },
    { key: 'scope-variables', label: 'Scope' },
    { key: 'funciones', label: 'Funciones' },
    { key: 'asincronia', label: 'Asincronia' },
    { key: 'sintaxis-es6', label: 'ES6+' },
    { key: 'objetos', label: 'Objetos' },
]

// Radio 18 → circunferencia = 2π×18
const CIRCUMFERENCE = 2 * Math.PI * 18

const LEGEND = [
    { label: 'Sin datos', color: '#374151' },
    { label: 'Débil   (0–40%)', color: '#ef4444' },
    { label: 'Regular (41–70%)', color: '#f97316' },
    { label: 'Fuerte (71–100%)', color: '#22c55e' },
]

function masteryColor(correct, total) {
    if (total === 0) return '#374151'
    const pct = Math.round((correct / total) * 100)
    if (pct > 70) return '#22c55e'   // verde  71-100 %
    if (pct > 40) return '#f97316'   // naranja 41-70 %
    return '#ef4444'                 // rojo    0-40  %
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

// ── Navigation ─────────────────────────────────────────────────────────────
function goToReview(categoryKey) {
    router.push({ path: '/category-review/', query: { category: categoryKey } })
}
</script>