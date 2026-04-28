<template>
    <div class="flex flex-col bg-white[0.03] border border-white-[0.08] rounded-2xl p-6">
        <!-- Header -->
        <div class="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6">
        <div>
            <h2 class="text-3xl font-bold text-white tracking-tight">Rendimiento</h2>
            <p class="text-sm text-indigo-300/50 mt-1 italic">Métricas de precisión de los últimos 14 tests</p>
        </div>
        <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 border-b border-white/5 pb-6">
            <div v-if="performanceStatus" 
                :class="[performanceStatus.bg, performanceStatus.border]"
                class="border px-4 py-2.5 rounded-2xl transition-all duration-500 flex flex-col items-end">
                <span :class="performanceStatus.color" class="text-xs font-bold uppercase tracking-tighter">
                    {{ performanceStatus.text }}
                </span>
                <span class="text-[10px] text-white/40 font-medium">
                    {{ performanceStatus.subtext }}
                </span>
            </div>
        </div>
    </div>
    <div class="grid grid-cols-2">  
        <div class="border border-white/5 rounded-[2rem] overflow-hidden">
            <!-- v-calendar -->
            <VCalendar :attributes="calendarAttributes" :min-date="rangeStart" :max-date="rangeEnd"
                        :first-day-of-week="2" :masks="{ weekdays: 'WWW' }" expanded borderless @dayclick="onDayClick" />
            <!-- Detalle del día seleccionado -->
            <transition enter-active-class="transition-all duration-200 ease-out"
                        enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition-all duration-150 ease-in"
                        leave-to-class="opacity-0 -translate-y-1">
                <div v-if="selectedDay" class="mx-4 mb-4 bg-white/[0.05] border border-white/10 rounded-[14px] p-4">
                    <div class="flex justify-between items-center mb-3">
                        <span class="text-sm font-semibold text-white">{{ selectedDay.dateLabel }}</span>
                        <button
                            class="text-white/35 hover:text-white/70 text-xs px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                            @click="selectedDay = null">✕
                        </button>
                    </div>
                    <template v-if="selectedDay.total > 0">
                        <div class="flex flex-col gap-2.5">
                            <div class="flex items-baseline gap-2">
                                <span class="text-[2rem] font-extrabold leading-none"
                                    :class="accuracyColorClass(selectedDay.percent)">
                                    {{ selectedDay.percent }}%
                                </span>
                                <span class="text-[0.72rem] text-white/40">precisión</span>
                            </div>
                            <div class="flex justify-between text-[0.78rem] text-white/50">
                                <span>Respuestas</span>
                                <span class="text-white/80 font-medium">{{ selectedDay.correct }}/{{
                                    selectedDay.total }}</span>
                            </div>
                            <div class="flex justify-between text-[0.78rem] text-white/50">
                                <span>Sesiones</span>
                                <span class="text-white/80 font-medium">{{ selectedDay.sessions }}</span>
                            </div>
                            <div class="h-1.5 bg-black/30 rounded-full overflow-hidden">
                                <div class="h-full rounded-full transition-[width] duration-500 ease-out"
                                    :class="accuracyBgClass(selectedDay.percent)"
                                    :style="{ width: selectedDay.percent + '%' }" />
                            </div>
                        </div>
                    </template>
                    <p v-else class="text-[0.8rem] text-white/30">Sin actividad registrada</p>
                </div>
            </transition>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <article v-for="metric in summaryMetrics" :key="metric.label"
                class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-5 transition-all duration-300">
                <p class="text-[10px] uppercase font-black text-indigo-300/40 tracking-widest mb-3">{{ metric.label }}</p>
                <p class="text-3xl font-black text-white group-hover:text-indigo-300 transition-colors">{{ metric.value }}</p>
                <p class="text-[10px] text-white/20 mt-2 font-medium">{{ metric.helper }}</p>
              </article>
            </div>
        </div>
    </div>
</template>

<script setup>
import { computed, ref, onMounted } from 'vue'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/style.css'
import { sessionService } from '@/api/session.service'

// ── Constantes ───────────────────────────────────────────────────
const LS_WEEKLY = 'ludoscript_weeklySessions'
const TWO_WEEKS_DAYS = 14
const HISTORY_MS = TWO_WEEKS_DAYS * 24 * 60 * 60 * 1000

const LEGEND = [
    { label: 'Sin datos', dotClass: 'bg-zinc-600' },
    { label: 'Bajo', dotClass: 'bg-rose-400' },
    { label: 'Medio', dotClass: 'bg-amber-400' },
    { label: 'Alto', dotClass: 'bg-emerald-400' },
]

const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })

// ── Utilidades ───────────────────────────────────────────────────
const startOfDay = (date) => {
    const d = new Date(date)
    d.setHours(0, 0, 0, 0)
    return d
}

const toDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const getAccuracy = (correct, total) =>
    total > 0 ? Math.round((correct / total) * 100) : null

const formatRange = (start, end) => `${fmt.format(start)} – ${fmt.format(end)}`

function accuracyColorClass(percent) {
    if (percent == null) return 'text-white/30'
    if (percent >= 85) return 'text-emerald-400'
    if (percent >= 65) return 'text-cyan-400'
    if (percent >= 45) return 'text-amber-400'
    return 'text-rose-400'
}

function accuracyBgClass(percent) {
    if (percent == null) return 'bg-zinc-600'
    if (percent >= 85) return 'bg-emerald-400'
    if (percent >= 65) return 'bg-cyan-400'
    if (percent >= 45) return 'bg-amber-400'
    return 'bg-rose-400'
}

function dotHexColor(percent, total) {
    if (total === 0) return '#52525b' // zinc-600
    if (percent >= 85) return '#34d399' // emerald-400
    if (percent >= 65) return '#22d3ee' // cyan-400
    if (percent >= 45) return '#fbbf24' // amber-400
    return '#f87171'                      // rose-400
}

// ── Datos (cargados desde la API con fallback a localStorage) ─────────────
const recentSessions = ref([])

onMounted(async () => {
    try {
        const res = await sessionService.getRecentSessions(14)
        recentSessions.value = res.data ?? []
    } catch (_) {
        try {
            const cutoff = Date.now() - HISTORY_MS
            recentSessions.value = JSON.parse(localStorage.getItem(LS_WEEKLY) || '[]')
                .filter(s => s.timestamp >= cutoff)
        } catch { recentSessions.value = [] }
    }
})

const sessionsByDate = computed(() => {
    const agg = {}
    for (const session of recentSessions.value) {
        const key = toDateKey(startOfDay(new Date(session.timestamp)))
        if (!agg[key]) agg[key] = { correct: 0, total: 0, sessions: 0 }
        agg[key].sessions++
        for (const stat of Object.values(session.stats ?? {})) {
            agg[key].correct += stat.correct ?? 0
            agg[key].total += stat.total ?? 0
        }
    }
    return agg
})
// -- Lógica de mensajes de estado dinámicos --
const performanceStatus = computed(() => {
    const accuracy = getAccuracy(totals.value.correct, totals.value.total);
    
    if (accuracy === null) return null;

    if (accuracy >= 90) {
        return {
            text: '¡Rendimiento Maestro!',
            subtext: 'Nivel excepcional',
            color: 'text-emerald-400',
            bg: 'bg-emerald-500/10',
            border: 'border-emerald-500/20'
        };
    } else if (accuracy >= 75) {
        return {
            text: 'Progresando adecuadamente',
            subtext: 'Buen ritmo de aprendizaje',
            color: 'text-cyan-400',
            bg: 'bg-cyan-500/10',
            border: 'border-cyan-500/20'
        };
    } else if (accuracy >= 50) {
        return {
            text: 'Rendimiento estable',
            subtext: 'Sigue practicando para mejorar',
            color: 'text-amber-400',
            bg: 'bg-amber-500/10',
            border: 'border-amber-500/20'
        };
    } else {
        return {
            text: 'Necesitas más práctica',
            subtext: 'No te rindas, la clave es la constancia',
            color: 'text-rose-400',
            bg: 'bg-rose-500/10',
            border: 'border-rose-500/20'
        };
    }
});
// ── Rango dinámico: desde la sesión más antigua hasta hoy ────────────────
const rangeEnd = computed(() => startOfDay(new Date()))

const rangeStart = computed(() => {
    if (recentSessions.value.length === 0) {
        const d = new Date(rangeEnd.value)
        d.setDate(d.getDate() - (TWO_WEEKS_DAYS - 1))
        return d
    }
    const oldest = Math.min(...recentSessions.value.map(s => s.timestamp))
    return startOfDay(new Date(oldest))
})

const rangeDays = computed(() => {
    const days = []
    const current = new Date(rangeStart.value)
    const end = new Date(rangeEnd.value)
    while (current <= end) {
        days.push(new Date(current))
        current.setDate(current.getDate() + 1)
    }
    return days
})

const rangeLabel = computed(() => formatRange(rangeStart.value, rangeEnd.value))

// ── Atributos v-calendar ─────────────────────────────────────────
const calendarAttributes = computed(() =>
    rangeDays.value.map(date => {
        const key = toDateKey(date)
        const data = sessionsByDate.value[key] ?? { correct: 0, total: 0, sessions: 0 }
        const percent = getAccuracy(data.correct, data.total)
        const color = dotHexColor(percent ?? 0, data.total)

        return {
            key,
            dates: date,
            dot: {
                style: { backgroundColor: color, width: '8px', height: '8px', borderRadius: '50%' },
            },
            ...(data.total > 0 && {
                highlight: {
                    style: {
                        backgroundColor: color + '22',
                        border: `1px solid ${color}44`,
                        borderRadius: '8px',
                    },
                },
            }),
        }
    })
)

// ── Día seleccionado ─────────────────────────────────────────────
const selectedDay = ref(null)

function onDayClick({ date }) {
    const key = toDateKey(date)
    const data = sessionsByDate.value[key] ?? { correct: 0, total: 0, sessions: 0 }
    selectedDay.value = {
        ...data,
        percent: getAccuracy(data.correct, data.total),
        dateKey: key,
        dateLabel: fmt.format(date),
    }
}

// ── Totales y métricas ───────────────────────────────────────────
const totals = computed(() =>
    Object.values(sessionsByDate.value).reduce(
        (acc, day) => {
            acc.correct += day.correct
            acc.total += day.total
            acc.sessions += day.sessions
            if (day.total > 0) acc.activeDays++
            return acc
        },
        { correct: 0, total: 0, sessions: 0, activeDays: 0 }
    )
)

const bestDay = computed(() =>
    rangeDays.value
        .map(date => {
            const data = sessionsByDate.value[toDateKey(date)]
            if (!data?.total) return null
            return { ...data, percent: getAccuracy(data.correct, data.total), date }
        })
        .filter(Boolean)
        .sort((a, b) => b.percent - a.percent || b.total - a.total)
        .at(0) ?? null
)

const summaryMetrics = computed(() => {
    const accuracy = getAccuracy(totals.value.correct, totals.value.total)
    return [
        {
            label: 'Precisión media',
            value: accuracy !== null ? `${accuracy}%` : '-',
            helper: `${totals.value.correct}/${totals.value.total} respuestas correctas`,
        },
        {
            label: 'Días activos',
            value: totals.value.activeDays,
            helper: `de ${recentSessions.value.length} tests analizados`,
        },
        {
            label: 'Sesiones',
            value: totals.value.sessions,
            helper: 'intentos de quiz registrados',
        },
        {
            label: 'Mejor día',
            value: bestDay.value ? `${bestDay.value.percent}%` : '-',
            helper: bestDay.value
                ? `${fmt.format(bestDay.value.date)} · ${bestDay.value.correct}/${bestDay.value.total}`
                : 'sin datos suficientes',
        },
    ]
})

const hasActivity = computed(() =>
    Object.values(sessionsByDate.value).some(e => e.total > 0)
)
</script>

<style scoped>
/* Solo overrides de v-calendar — no expresables con Tailwind por ser :deep() */
:deep(.vc-container) {
    background: transparent !important;
    border: none !important;
    color: rgba(255, 255, 255, 0.75) !important;
    font-family: inherit !important;
    width: 100% !important;
}

:deep(.vc-header) {
    padding: 12px 16px 0 !important;
}

:deep(.vc-title) {
    color: rgba(255, 255, 255, 0.65) !important;
    font-size: 0.82rem !important;
    font-weight: 500 !important;
    background: transparent !important;
}

:deep(.vc-arrow) {
    color: rgba(255, 255, 255, 0.4) !important;
    background: transparent !important;
    border-radius: 8px !important;
}

:deep(.vc-arrow:hover) {
    background: rgba(255, 255, 255, 0.08) !important;
}

:deep(.vc-weekday) {
    color: rgba(255, 255, 255, 0.3) !important;
    font-size: 0.68rem !important;
}

:deep(.vc-day-content) {
    color: rgba(255, 255, 255, 0.65) !important;
    font-size: 0.82rem !important;
    border-radius: 8px !important;
    transition: background 0.15s !important;
}

:deep(.vc-day-content:hover) {
    background: rgba(255, 255, 255, 0.08) !important;
    cursor: pointer !important;
}

:deep(.vc-day-content.is-disabled) {
    color: rgba(255, 255, 255, 0.15) !important;
}

:deep(.vc-dots) {
    gap: 3px !important;
}
</style>