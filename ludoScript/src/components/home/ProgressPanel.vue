<template>
    <div class="flex flex-col">

        <!-- Modo contextual (badge sutil) -->
        <div v-if="modeContext && hasData" class="flex items-center gap-1.5 mb-5">
            <span class="inline-flex items-center gap-1 text-[10px] font-semibold text-indigo-400/70 uppercase tracking-widest
                   bg-indigo-500/10 border border-indigo-500/15 rounded-full px-2.5 py-0.5">
                {{ modeContext }}
            </span>
        </div>

        <!-- ══════════════════════════════════════════════
         ESTADO VACÍO — Onboarding
    ══════════════════════════════════════════════ -->
        <div v-if="!loading && !hasData" class="flex flex-col items-center text-center py-4 gap-5">
            <div class="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/15
                  flex items-center justify-center text-2xl">
                📈
            </div>
            <div>
                <p class="text-sm font-semibold text-white mb-2">Sin estadísticas aún</p>
                <p class="text-[12px] text-slate-400 leading-relaxed">
                    Completa tu primera sesión de estudio para ver cómo evoluciona tu aprendizaje.
                </p>
            </div>
            <div class="w-full flex flex-col gap-2">
                <div class="flex items-center gap-3 bg-slate-800/40 rounded-xl px-3.5 py-2.5 text-left">
                    <span class="text-indigo-400 text-sm shrink-0">✦</span>
                    <span class="text-[11px] text-slate-400">Tu porcentaje de aciertos por tema</span>
                </div>
                <div class="flex items-center gap-3 bg-slate-800/40 rounded-xl px-3.5 py-2.5 text-left">
                    <span class="text-indigo-400 text-sm shrink-0">✦</span>
                    <span class="text-[11px] text-slate-400">Tu racha de días consecutivos</span>
                </div>
                <div class="flex items-center gap-3 bg-slate-800/40 rounded-xl px-3.5 py-2.5 text-left">
                    <span class="text-indigo-400 text-sm shrink-0">✦</span>
                    <span class="text-[11px] text-slate-400">Sugerencias personalizadas para ti</span>
                </div>
            </div>
        </div>

        <!-- ══════════════════════════════════════════════
         CONTENIDO PRINCIPAL
    ══════════════════════════════════════════════ -->
        <template v-else-if="!loading">

            <!-- HERO: Aciertos -->
            <section class="mb-7">
                <div class="flex items-start justify-between mb-2">
                    <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest">Aciertos</p>
                    <span v-if="weekTrend !== null" :class="weekTrend >= 0
                        ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20'
                        : 'text-red-400 bg-red-500/10 border-red-500/20'"
                        class="text-[10px] font-semibold border rounded-full px-2 py-0.5 leading-none">
                        {{ weekTrend >= 0 ? '+' : '' }}{{ weekTrend }}% esta semana
                    </span>
                </div>

                <div class="flex items-baseline gap-2 mb-3">
                    <span class="text-5xl font-extrabold text-white tabular-nums leading-none">{{ globalAccuracy
                    }}</span>
                    <span class="text-2xl font-bold text-slate-500">%</span>
                    <span v-if="sessionComparison" class="text-[11px] font-medium ml-0.5"
                        :class="sessionComparison.diff > 0 ? 'text-emerald-400' : 'text-red-400'">
                        {{ sessionComparison.text }}
                    </span>
                </div>

                <div class="h-1.5 w-full bg-slate-700/50 rounded-full overflow-hidden">
                    <div class="h-full rounded-full transition-all duration-700"
                        :style="{ width: globalAccuracy + '%', background: heroBarGradient }" />
                </div>

                <p class="text-[11px] text-slate-500 mt-2.5">{{ accuracyLabel }}</p>
            </section>

            <div class="border-t border-slate-700/30 mb-7" />

            <!-- ANALISIS: Para ti, hoy -->
            <section v-if="strongestCat || weakestCat" class="mb-7">
                <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-5">Para ti, hoy</p>

                <div class="flex flex-col gap-4">
                    <!-- Punto fuerte -->
                    <div v-if="strongestCat" class="flex items-start gap-3.5">
                        <div class="mt-0.5 w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20
                        flex items-center justify-center shrink-0">
                            <span class="text-emerald-400 text-sm font-bold">↑</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[10px] text-emerald-400/70 uppercase tracking-wider font-semibold mb-0.5">Tu
                                punto fuerte</p>
                            <p class="text-sm font-semibold text-white leading-tight">{{ strongestCat.label }}</p>
                            <p class="text-[11px] text-slate-400 mt-0.5">{{ strongestCat.accuracy }}% de aciertos</p>
                        </div>
                    </div>

                    <!-- A reforzar -->
                    <div v-if="weakestCat" class="flex items-start gap-3.5">
                        <div class="mt-0.5 w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20
                        flex items-center justify-center shrink-0">
                            <span class="text-amber-400 text-sm">◈</span>
                        </div>
                        <div class="flex-1 min-w-0">
                            <p class="text-[10px] text-amber-400/70 uppercase tracking-wider font-semibold mb-0.5">A
                                reforzar</p>
                            <p class="text-sm font-semibold text-white leading-tight">{{ weakestCat.label }}</p>
                            <p class="text-[11px] text-slate-400 mt-0.5">{{ weakestCat.accuracy }}% · sigue practicando
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <div v-if="categoryBars.length" class="border-t border-slate-700/30 mb-7" />

            <!-- POR TEMA: Barras horizontales -->
            <section v-if="categoryBars.length" class="mb-7">
                <p class="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-4">Por tema</p>
                <div class="flex flex-col gap-3.5">
                    <button v-for="cat in categoryBars" :key="cat.slug"
                        class="group w-full text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 rounded-lg"
                        @click="goToCategory(cat.slug)">
                        <div class="flex items-center justify-between mb-1.5">
                            <span
                                class="text-[12px] text-slate-300 group-hover:text-white transition-colors truncate mr-2 leading-tight">
                                {{ cat.label }}
                            </span>
                            <span class="text-[11px] font-semibold tabular-nums shrink-0" :style="{ color: cat.color }">
                                {{ cat.accuracy }}%
                            </span>
                        </div>
                        <div class="h-1.5 w-full bg-slate-700/40 rounded-full overflow-hidden">
                            <div class="h-full rounded-full transition-all duration-700"
                                :style="{ width: cat.accuracy + '%', backgroundColor: cat.color, opacity: 0.75 }" />
                        </div>
                    </button>
                </div>

                <button v-if="allCategoryBars.length > 5"
                    class="mt-4 text-[11px] text-indigo-400/60 hover:text-indigo-300 transition-colors"
                    @click="showAllCategories = !showAllCategories">
                    {{ showAllCategories ? 'Ver menos' : `+${allCategoryBars.length - 5} categorías más` }}
                </button>
            </section>

            <div class="border-t border-slate-700/30 mb-5" />

            <!-- RACHA: sutil, al final -->
            <section class="flex items-center gap-4 py-1">
                <div class="flex flex-col items-center min-w-[40px]">
                    <span class="text-2xl font-extrabold leading-none"
                        :class="streak > 0 ? 'text-orange-400' : 'text-slate-600'">
                        {{ streak }}
                    </span>
                    <span class="text-[9px] text-slate-500 mt-0.5 uppercase tracking-widest">días</span>
                </div>
                <div class="border-l border-slate-700/50 pl-4 flex-1 min-w-0">
                    <p class="text-sm font-semibold text-white leading-tight">{{ streakTitle }}</p>
                    <p class="text-[11px] text-slate-400 mt-0.5 leading-tight">{{ streakMessage }}</p>
                </div>
            </section>

        </template>

        <!-- SKELETON DE CARGA -->
        <div v-if="loading" class="flex flex-col gap-5 animate-pulse">
            <div class="h-20 bg-slate-800/40 rounded-xl" />
            <div class="h-28 bg-slate-800/40 rounded-xl" />
            <div class="h-24 bg-slate-800/40 rounded-xl" />
        </div>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { storeToRefs } from 'pinia'
import { useAuthStore } from '@/stores/auth.store'
import { categoryStatsService } from '@/api/categoryStats.service'
import { sessionService } from '@/api/session.service'
import { formatCategoryLabel } from '@/composables/useAdaptiveSelection'

const props = defineProps({
    selectedFiles: { type: Array, default: () => [] },
    selectedPredefined: { type: Boolean, default: true },
})

const router = useRouter()

const authStore = useAuthStore()
const { userData } = storeToRefs(authStore)

const loading = ref(true)
const categoryStats = ref([])
const recentSessions = ref([])
const showAllCategories = ref(false)

// Calcula aciertos directo de categoryStats (más fiable que userData.accuracy)
const globalAccuracy = computed(() => {
    const stats = categoryStats.value.filter(s => s.total > 0)
    if (stats.length > 0) {
        const totalCorrect = stats.reduce((sum, c) => sum + (c.correct ?? 0), 0)
        const totalAttempts = stats.reduce((sum, c) => sum + (c.total ?? 0), 0)
        if (totalAttempts > 0) return Math.round((totalCorrect / totalAttempts) * 100)
    }
    return Math.round(userData.value?.accuracy ?? 0)
})

const hasData = computed(
    () => categoryStats.value.some(s => s.total > 0) || recentSessions.value.length > 0
)

const streak = computed(() => userData.value?.streak ?? 0)

function accentColor(accuracy) {
    if (accuracy >= 80) return '#22c55e'
    if (accuracy >= 65) return '#84cc16'
    if (accuracy >= 50) return '#eab308'
    if (accuracy >= 30) return '#f97316'
    return '#ef4444'
}

const heroBarGradient = computed(() => {
    const a = globalAccuracy.value
    if (a >= 80) return 'linear-gradient(90deg, #16a34a, #22c55e)'
    if (a >= 65) return 'linear-gradient(90deg, #65a30d, #84cc16)'
    if (a >= 50) return 'linear-gradient(90deg, #ca8a04, #eab308)'
    if (a >= 30) return 'linear-gradient(90deg, #ea580c, #f97316)'
    return 'linear-gradient(90deg, #dc2626, #ef4444)'
})

const accuracyLabel = computed(() => {
    const a = globalAccuracy.value
    if (a >= 85) return 'Excelente rendimiento'
    if (a >= 70) return 'Buen rendimiento general'
    if (a >= 55) return 'Rendimiento en progreso'
    if (a >= 40) return 'Hay margen de mejora'
    return 'Sigue practicando'
})

// Tendencia semanal: promedio mitad más reciente vs. mitad anterior
const weekTrend = computed(() => {
    const accuracies = recentSessions.value
        .map(s => s.summary?.accuracy ?? null)
        .filter(a => a !== null)

    if (accuracies.length < 4) return null

    const half = Math.min(7, Math.ceil(accuracies.length / 2))
    const recent = accuracies.slice(0, half)
    const older = accuracies.slice(half, half * 2)

    if (!recent.length || !older.length) return null

    const avgRecent = recent.reduce((s, a) => s + a, 0) / recent.length
    const avgOlder = older.reduce((s, a) => s + a, 0) / older.length
    const diff = Math.round(avgRecent - avgOlder)

    return Math.abs(diff) < 1 ? null : diff
})

// Comparativa última sesión vs. penúltima
const sessionComparison = computed(() => {
    const sessions = recentSessions.value
    if (sessions.length < 2) return null

    const last = sessions[0]?.summary?.accuracy
    const prev = sessions[1]?.summary?.accuracy
    if (last == null || prev == null) return null

    const diff = Math.round(last - prev)
    if (Math.abs(diff) < 2) return null

    return {
        diff,
        text: diff > 0 ? `+${diff}% respecto a ayer` : `${diff}% respecto a ayer`,
    }
})

const streakTitle = computed(() => {
    const s = streak.value
    if (s === 0) return 'Sin racha activa'
    if (s === 1) return '1 día seguido'
    return `${s} días seguidos`
})

const streakMessage = computed(() => {
    const s = streak.value
    if (s === 0) return 'Empieza tu racha hoy'
    if (s <= 2) return '¡Buen comienzo!'
    if (s <= 6) return 'Buen ritmo esta semana'
    if (s <= 14) return '¡Sigue así, lo estás haciendo muy bien!'
    return '¡Racha impresionante!'
})

const allCategoryBars = computed(() =>
    categoryStats.value
        .filter(s => s.total >= 1)
        .map(s => ({
            slug: s.category,
            label: formatCategoryLabel(s.category),
            accuracy: Math.round((s.correct / s.total) * 100),
            total: s.total,
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
        .map(c => ({ ...c, color: accentColor(c.accuracy) }))
)

const categoryBars = computed(() =>
    showAllCategories.value ? allCategoryBars.value : allCategoryBars.value.slice(0, 5)
)

const strongestCat = computed(() => {
    const cats = categoryStats.value
        .filter(s => s.total >= 3)
        .map(s => ({
            slug: s.category,
            label: formatCategoryLabel(s.category),
            accuracy: Math.round((s.correct / s.total) * 100),
        }))
        .sort((a, b) => b.accuracy - a.accuracy)
    return cats[0] ?? null
})

const weakestCat = computed(() => {
    const cats = categoryStats.value
        .filter(s => s.total >= 3)
        .map(s => ({
            slug: s.category,
            label: formatCategoryLabel(s.category),
            accuracy: Math.round((s.correct / s.total) * 100),
        }))
        .sort((a, b) => a.accuracy - b.accuracy)
    return cats[0] ?? null
})

const modeContext = computed(() => {
    const hasCustom = props.selectedFiles.length > 0
    const hasPredefined = props.selectedPredefined
    if (hasCustom && hasPredefined) return 'Modo mixto'
    if (hasCustom) return 'Contenido personalizado'
    return null
})

function goToCategory(slug) {
    router.push({ path: '/category-review/', query: { category: slug } })
}

onMounted(async () => {
    const [statsResult, sessionsResult] = await Promise.allSettled([
        categoryStatsService.getAll(),
        sessionService.getRecentSessions(14),
    ])

    if (statsResult.status === 'fulfilled') {
        categoryStats.value = statsResult.value?.data ?? []
    }

    if (sessionsResult.status === 'fulfilled') {
        recentSessions.value = sessionsResult.value?.data ?? []
    }

    loading.value = false
})
</script>
