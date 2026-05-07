<template>
    <div class="flex flex-col gap-6">
        <!-- Última sesión -->
        <section>
            <h3 class="text-[11px] font-semibold text-blue-400/70 uppercase tracking-widest mb-3 font-righteous">
                Última sesión
            </h3>

            <div v-if="summary" class="flex flex-col items-center gap-4">
                <!-- <div class="grid grid-cols-2"> -->
                <!-- Anillo SVG grande con precisión global -->
                <div class="relative w-24 h-24">
                    <svg viewBox="0 0 60 60" class="w-full h-full -rotate-90">
                        <!-- Track de fondo -->
                        <circle cx="30" cy="30" r="24" fill="none" stroke="#1e293b" stroke-width="5" />
                        <!-- Arco de progreso -->
                        <circle cx="30" cy="30" r="24" fill="none" :stroke="ringColor" stroke-width="5"
                            stroke-linecap="round" :stroke-dasharray="CIRCUMFERENCE"
                            :stroke-dashoffset="CIRCUMFERENCE * (1 - summary.accuracy / 100)"
                            class="transition-all duration-700" />
                    </svg>
                    <div class="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <span class="text-lg font-extrabold text-white leading-none">{{ summary.accuracy }}%</span>
                        <span class="text-[9px] text-slate-400 leading-none">aciertos</span>
                    </div>
                </div>
                <!-- </div> -->

                <!-- Stats en fila -->
                <div class="flex flex-col gap-1 text-[11px] text-slate-400 w-full">
                    <div class="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-800/40">
                        <span>⏱ Tiempo</span>
                        <span class="text-slate-300 font-medium">{{ summary.elapsedMin }} min</span>
                    </div>
                    <div class="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-800/40">
                        <span>✏ Preguntas</span>
                        <span class="text-slate-300 font-medium">{{ summary.totalQuestions }}</span>
                    </div>
                    <div class="flex items-center justify-between px-2 py-1 rounded-lg bg-slate-800/40">
                        <span>🔥 Racha máx.</span>
                        <span class="text-slate-300 font-medium">{{ summary.maxStreak }}</span>
                    </div>
                </div>

                <!-- Mini-anillos por categoría -->
                <div v-if="categoryRings.length" class="w-full">
                    <p class="text-[10px] text-slate-500 uppercase tracking-widest mb-2">Por categoría</p>
                    <div class="grid grid-cols-3 gap-3">
                        <div v-for="cat in categoryRings" :key="cat.label"
                            class="flex flex-col items-center gap-1 cursor-pointer hover:opacity-80 transition-opacity"
                            @click="router.push({ path: '/category-review/', query: { category: cat.slug } })">
                            <div class="relative w-14 h-14">
                                <svg viewBox="0 0 36 36" class="w-full h-full -rotate-90">
                                    <circle cx="18" cy="18" r="14" fill="none" stroke="#1e293b" stroke-width="3.5" />
                                    <circle cx="18" cy="18" r="14" fill="none" :stroke="cat.color" stroke-width="3.5"
                                        stroke-linecap="round" :stroke-dasharray="MINI_CIRCUMFERENCE"
                                        :stroke-dashoffset="MINI_CIRCUMFERENCE * (1 - cat.accuracy / 100)"
                                        class="transition-all duration-700" />
                                </svg>
                                <div class="absolute inset-0 flex items-center justify-center">
                                    <span class="text-[10px] font-bold text-white leading-none">{{ cat.accuracy
                                    }}%</span>
                                </div>
                            </div>
                            <span class="text-[10px] text-slate-400 text-center leading-tight">{{ cat.label }}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div v-else class="text-[11px] text-gray-500 italic">
                <p>
                    Completa una actividad para ver tus estadísticas.
                </p>
            </div>
        </section>

    </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { formatCategoryLabel } from '@/composables/useAdaptiveSelection'
import { gameService } from '@/api/game.service'
import { sessionService } from '@/api/session.service'
import { userScopedStorageKey } from '@/utils/storageKeys'


const router = useRouter()

// r=24 → circunferencia = 2π×24
const CIRCUMFERENCE = 2 * Math.PI * 24
// r=14 → circunferencia = 2π×14
const MINI_CIRCUMFERENCE = 2 * Math.PI * 14

const summary = ref(null)

function buildSummary(session) {
    if (!session || typeof session !== 'object') return null

    const hasSummary =
        session.summary &&
        typeof session.summary === 'object' &&
        session.summary.accuracy != null &&
        session.summary.totalQuestions != null &&
        session.summary.maxStreak != null

    if (hasSummary) return session.summary

    const stats = session.stats || {}
    const totalQuestions = Object.values(stats).reduce(
        (sum, item) => sum + (item?.total ?? 0),
        0,
    )
    const totalCorrect = Object.values(stats).reduce(
        (sum, item) => sum + (item?.correct ?? 0),
        0,
    )
    const accuracy = totalQuestions ? Math.round((totalCorrect / totalQuestions) * 100) : 0

    return {
        accuracy,
        elapsedMin: session.elapsedMin ?? 0,
        totalQuestions,
        maxStreak: session.maxStreak ?? 0,
    }
}

const ringColor = computed(() => {
    if (!summary.value) return '#374151'
    if (summary.value.accuracy > 70) return '#22c55e'
    if (summary.value.accuracy > 40) return '#f97316'
    return '#ef4444'
})

function categoryRingColor(accuracy) {
    if (accuracy >= 80) return '#22c55e'   // verde
    if (accuracy >= 65) return '#84cc16'   // lima
    if (accuracy >= 50) return '#eab308'   // amarillo
    if (accuracy >= 30) return '#f97316'   // naranja
    return '#ef4444'                       // rojo
}

function parseCategoryRings(stats) {
    return Object.entries(stats)
        .filter(([, s]) => s.total > 0)
        .map(([cat, s]) => {
            const accuracy = Math.round((s.correct / s.total) * 100)
            return {
                slug: cat,
                label: formatCategoryLabel(cat),
                accuracy,
                color: categoryRingColor(accuracy),
            }
        })
}

// Anillos de categorías: se cargan desde la API con fallback a localStorage
const LS_LAST_SESSION = 'ludoscript_lastSession'
const categoryRings = ref([])

// Historial de partidas (Quiz + FlashCards)
const historyLoading = ref(true)
const recentGames = ref([])

onMounted(async () => {
    let lastSession = null

    try {
        lastSession = await sessionService.getLastSession()
    } catch (_) {
        lastSession = null
    }

    if (lastSession) {
        summary.value = buildSummary(lastSession)
        categoryRings.value = parseCategoryRings(lastSession.stats ?? {})
    } else {
        try {
            const raw = localStorage.getItem(userScopedStorageKey(LS_LAST_SESSION))
            if (raw) {
                const sessionData = JSON.parse(raw)
                summary.value = buildSummary(sessionData)
                categoryRings.value = parseCategoryRings(sessionData.stats ?? {})
            }
        } catch (__) {
            /* ignorar */
        }
    }

    // Cargar historial de partidas
    try {
        const res = await gameService.getMine()
        recentGames.value = (res.data ?? [])
            .filter((g) => g.gameName === 'Quiz' || g.gameName === 'FlashCards')
            .sort((a, b) => new Date(b.playedAt) - new Date(a.playedAt))
            .slice(0, 8)
    } catch (_) {
        recentGames.value = []
    } finally {
        historyLoading.value = false
    }
})
</script>