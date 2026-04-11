<template>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
        <div class="flex flex-col gap-1 mb-5">
            <h2 class="text-white font-semibold text-base">Vista general de progreso</h2>
            <p class="text-white/50 text-xs">
                Calendario de los ultimos 14 dias para ver de un vistazo tu ritmo y porcentaje de acierto.
            </p>
        </div>

        <div v-if="!hasActivity" class="text-center py-6 text-white/40 text-sm">
            Sin actividad en los ultimos 14 dias. Completa un Quiz para empezar a llenar el calendario.
        </div>

        <div v-else class="space-y-5">
            <div class="grid grid-cols-2 xl:grid-cols-4 gap-3">
                <article
                    v-for="metric in summaryMetrics"
                    :key="metric.label"
                    class="rounded-xl border border-white/10 bg-white/5 px-4 py-3"
                >
                    <p class="text-[11px] uppercase tracking-wide text-white/45">{{ metric.label }}</p>
                    <p class="mt-2 text-2xl font-semibold text-white">{{ metric.value }}</p>
                    <p class="mt-1 text-xs text-white/45">{{ metric.helper }}</p>
                </article>
            </div>

            <section class="rounded-2xl border border-white/10 bg-slate-950/35 overflow-hidden">
                <div class="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
                    <div>
                        <p class="text-sm font-medium text-white">Calendario de rendimiento</p>
                        <p class="text-xs text-white/45">{{ rangeLabel }}</p>
                    </div>
                    <div class="flex items-center gap-2 text-[11px] text-white/45">
                        <span class="inline-flex items-center gap-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-zinc-700"></span>Sin datos
                        </span>
                        <span class="inline-flex items-center gap-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-rose-500"></span>Bajo
                        </span>
                        <span class="inline-flex items-center gap-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-amber-400"></span>Medio
                        </span>
                        <span class="inline-flex items-center gap-1">
                            <span class="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>Alto
                        </span>
                    </div>
                </div>

                <div class="p-4 overflow-x-auto">
                    <div class="min-w-[520px]">
                        <div class="grid grid-cols-[88px_repeat(2,minmax(0,1fr))] gap-2 mb-2">
                            <div></div>
                            <div
                                v-for="column in weekColumns"
                                :key="column.key"
                                class="rounded-lg bg-white/5 border border-white/10 px-3 py-2 text-center"
                            >
                                <p class="text-[11px] uppercase tracking-wide text-white/40">
                                    {{ column.label }}
                                </p>
                                <p class="text-xs text-white/70 mt-1">{{ column.range }}</p>
                            </div>
                        </div>

                        <div class="space-y-2">
                            <div
                                v-for="row in calendarRows"
                                :key="row.label"
                                class="grid grid-cols-[88px_repeat(2,minmax(0,1fr))] gap-2 items-stretch"
                            >
                                <div class="flex items-center px-2">
                                    <span class="text-sm font-medium text-white/80">{{ row.label }}</span>
                                </div>

                                <article
                                    v-for="cell in row.cells"
                                    :key="cell.dateKey"
                                    :class="cell.cardClass"
                                    :title="cell.tooltip"
                                    class="rounded-xl border px-3 py-3 transition-colors"
                                >
                                    <div class="flex items-start justify-between gap-2">
                                        <div>
                                            <p class="text-[11px] uppercase tracking-wide text-white/45">
                                                {{ cell.monthLabel }}
                                            </p>
                                            <p class="text-lg font-semibold text-white">
                                                {{ cell.dayNumber }}
                                            </p>
                                        </div>
                                        <span class="text-[11px] text-white/45">
                                            {{ cell.sessions }} ses.
                                        </span>
                                    </div>

                                    <div v-if="cell.total > 0" class="mt-3">
                                        <div class="flex items-end justify-between gap-3">
                                            <span class="text-2xl font-bold text-white">{{ cell.percent }}%</span>
                                            <span class="text-xs text-white/55">{{ cell.correct }}/{{ cell.total }}</span>
                                        </div>
                                        <div class="mt-3 h-1.5 rounded-full bg-black/20 overflow-hidden">
                                            <div
                                                class="h-full rounded-full bg-white/80"
                                                :style="{ width: `${cell.percent}%` }"
                                            ></div>
                                        </div>
                                    </div>

                                    <div v-else class="mt-5 text-sm text-white/35">
                                        Sin actividad
                                    </div>
                                </article>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    </div>
</template>

<script setup>
import { computed, ref } from 'vue'

const LS_WEEKLY = 'ludoscript_weeklySessions'
const DAY_MS = 24 * 60 * 60 * 1000
const TWO_WEEKS_DAYS = 14
const HISTORY_MS = TWO_WEEKS_DAYS * DAY_MS

const shortDateFormatter = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'short',
})

const monthFormatter = new Intl.DateTimeFormat('es-ES', {
    month: 'short',
})

const DAY_ORDER = [
    { index: 1, label: 'Lunes' },
    { index: 2, label: 'Martes' },
    { index: 3, label: 'Miercoles' },
    { index: 4, label: 'Jueves' },
    { index: 5, label: 'Viernes' },
    { index: 6, label: 'Sabado' },
    { index: 0, label: 'Domingo' },
]

function startOfDay(date) {
    const normalized = new Date(date)
    normalized.setHours(0, 0, 0, 0)
    return normalized
}

function toDateKey(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
}

function getAccuracy(correct, total) {
    return total > 0 ? Math.round((correct / total) * 100) : null
}

function formatRange(start, end) {
    return `${shortDateFormatter.format(start)} - ${shortDateFormatter.format(end)}`
}

function getCardClass(percent, total) {
    if (total === 0) return 'border-white/10 bg-zinc-900/60'
    if (percent >= 85) return 'border-emerald-400/30 bg-emerald-500/20'
    if (percent >= 65) return 'border-cyan-400/30 bg-cyan-500/20'
    if (percent >= 45) return 'border-amber-400/30 bg-amber-500/20'
    return 'border-rose-400/30 bg-rose-500/20'
}

function readRecentSessions() {
    try {
        const stored = JSON.parse(localStorage.getItem(LS_WEEKLY) || '[]')
        const cutoff = Date.now() - HISTORY_MS
        return stored.filter(session => session.timestamp >= cutoff)
    } catch (_) {
        return []
    }
}

const recentSessions = ref(readRecentSessions())

const sessionsByDate = computed(() => {
    const aggregated = {}

    for (const session of recentSessions.value) {
        const sessionDate = startOfDay(new Date(session.timestamp))
        const key = toDateKey(sessionDate)

        if (!aggregated[key]) {
            aggregated[key] = {
                correct: 0,
                total: 0,
                sessions: 0,
            }
        }

        aggregated[key].sessions += 1

        for (const stat of Object.values(session.stats ?? {})) {
            aggregated[key].correct += stat.correct ?? 0
            aggregated[key].total += stat.total ?? 0
        }
    }

    return aggregated
})

const lastTwoWeeksDays = computed(() => {
    const today = startOfDay(new Date())

    return Array.from({ length: TWO_WEEKS_DAYS }, (_, index) => {
        const date = new Date(today)
        date.setDate(today.getDate() - (TWO_WEEKS_DAYS - 1 - index))
        return date
    })
})

const weekColumns = computed(() =>
    [
        lastTwoWeeksDays.value.slice(0, 7),
        lastTwoWeeksDays.value.slice(7, 14),
    ].map((days, index) => ({
        key: `week-${index}`,
        label: `Bloque ${index + 1}`,
        range: formatRange(days[0], days[days.length - 1]),
    }))
)

const calendarRows = computed(() =>
    DAY_ORDER.map(day => {
        const cells = lastTwoWeeksDays.value
            .filter(date => date.getDay() === day.index)
            .sort((left, right) => left - right)
            .map(date => {
                const summary = sessionsByDate.value[toDateKey(date)] ?? {
                    correct: 0,
                    total: 0,
                    sessions: 0,
                }
                const percent = getAccuracy(summary.correct, summary.total)

                return {
                    ...summary,
                    dateKey: toDateKey(date),
                    dayNumber: String(date.getDate()).padStart(2, '0'),
                    monthLabel: monthFormatter.format(date),
                    percent,
                    cardClass: getCardClass(percent ?? 0, summary.total),
                    tooltip: summary.total > 0
                        ? `${shortDateFormatter.format(date)}: ${percent}% de acierto, ${summary.correct}/${summary.total} correctas en ${summary.sessions} sesiones.`
                        : `${shortDateFormatter.format(date)}: sin actividad registrada.`,
                }
            })

        return {
            label: day.label,
            cells,
        }
    })
)

const rangeLabel = computed(() =>
    formatRange(lastTwoWeeksDays.value[0], lastTwoWeeksDays.value[lastTwoWeeksDays.value.length - 1])
)

const totals = computed(() =>
    Object.values(sessionsByDate.value).reduce((accumulator, day) => {
        accumulator.correct += day.correct
        accumulator.total += day.total
        accumulator.sessions += day.sessions
        if (day.total > 0) accumulator.activeDays += 1
        return accumulator
    }, {
        correct: 0,
        total: 0,
        sessions: 0,
        activeDays: 0,
    })
)

const bestDay = computed(() => {
    const candidates = calendarRows.value
        .flatMap(row => row.cells.map(cell => ({ ...cell, weekday: row.label })))
        .filter(cell => cell.total > 0)
        .sort((left, right) => {
            if (right.percent !== left.percent) return right.percent - left.percent
            return right.total - left.total
        })

    return candidates[0] ?? null
})

const summaryMetrics = computed(() => {
    const accuracy = getAccuracy(totals.value.correct, totals.value.total)

    return [
        {
            label: 'Precision media',
            value: accuracy !== null ? `${accuracy}%` : '-',
            helper: `${totals.value.correct}/${totals.value.total} respuestas correctas`,
        },
        {
            label: 'Dias activos',
            value: totals.value.activeDays,
            helper: `de ${TWO_WEEKS_DAYS} dias analizados`,
        },
        {
            label: 'Sesiones',
            value: totals.value.sessions,
            helper: 'intentos de quiz registrados',
        },
        {
            label: 'Mejor dia',
            value: bestDay.value ? `${bestDay.value.weekday} ${bestDay.value.percent}%` : '-',
            helper: bestDay.value ? `${bestDay.value.correct}/${bestDay.value.total} correctas` : 'sin datos suficientes',
        },
    ]
})

const hasActivity = computed(() =>
    Object.values(sessionsByDate.value).some(entry => entry.total > 0)
)
</script>
