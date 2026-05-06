<template>
    <div class="border border-white/5 rounded-[2rem] overflow-hidden">
        <div v-if="!hasActivity" class="mx-3 mt-3 rounded-2xl border border-yellow-400/20 bg-yellow-400/10 p-4">
            <p class="text-sm font-bold text-white">Aún no tienes actividad reciente.</p>
            <p class="mt-1 text-xs text-indigo-100/65">
                Completa tu primer reto para empezar a ver tu progreso aquí.
            </p>
            <RouterLink to="/learning-area/"
                class="mt-3 inline-flex w-full sm:w-auto items-center justify-center rounded-xl bg-yellow-400 px-3 py-2 text-xs font-black text-slate-950 transition-colors hover:bg-yellow-300">
                Ir al área de aprendizaje
            </RouterLink>
        </div>

        <p class="px-4 pt-4 text-[11px] font-medium text-white/40">
            Los puntos marcan días con práctica; el color indica precisión.
        </p>

        <div class="overflow-y-auto max-h-[500px] custom-scroll">
            <div class="grid grid-cols-1 md:grid-cols-[1.7fr_1fr] gap-4 px-4 pb-4 min-w-0">
                <div class="min-w-0">
                    <VCalendar :attributes="calendarAttributes" :min-date="rangeStart" :max-date="rangeEnd"
                        :first-day-of-week="2" :masks="{ weekdays: 'WWW' }" expanded borderless
                        @dayclick="onDayClick" />
                </div>

                <transition enter-active-class="transition-all duration-200 ease-out"
                    enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition-all duration-150 ease-in"
                    leave-to-class="opacity-0 -translate-y-1">
                    <div v-if="selectedDay" id="day-detail"
                        class="min-w-0 bg-white/[0.05] border border-white/10 rounded-[14px] p-4 scroll-mt-4">
                        <div class="flex justify-between items-center mb-4">
                            <span class="text-md font-semibold text-white">{{ selectedDay.dateLabel }}</span>
                        </div>

                        <template v-if="selectedDay.total > 0">
                            <div class="flex flex-row flex-nowrap gap-4 items-center">
                                <div class="flex-1 space-y-3 min-w-0 align-items">
                                    <div class="flex justify-between text-[0.78rem] text-white/50">
                                        <span>Número de tests</span>
                                        <span class="text-white/80 font-medium">{{ selectedDay.sessions }}</span>
                                    </div>
                                    <div class="flex justify-between text-[0.78rem] text-white/50">
                                        <div>Respuestas acertadas</div>
                                        <span class="text-white/80 font-medium">
                                            {{ selectedDay.correct }}/{{ selectedDay.total }}
                                        </span>
                                    </div>
                                </div>
                                <div class="flex items-center justify-center">
                                    <div class="relative w-40 h-40">
                                        <svg class="absolute inset-0 w-full h-full transform -rotate-90"
                                            viewBox="0 0 100 100">
                                            <!-- Círculo de fondo -->
                                            <circle cx="50" cy="50" r="45" stroke="rgba(255,255,255,0.08)"
                                                stroke-width="8" fill="none" />
                                            <!-- Círculo de progreso -->
                                            <circle cx="50" cy="50" r="45" stroke="currentColor" stroke-width="8"
                                                fill="none" :stroke-dasharray="`${selectedDay.percent * 2.827} 282.7`"
                                                :class="ringColorClass(selectedDay.percent)" stroke-linecap="round" />
                                        </svg>
                                        <div
                                            class="absolute inset-0 flex flex-col items-center justify-center text-center">
                                            <span class="text-[2.2rem] font-black text-white">{{ selectedDay.percent
                                                }}%</span>
                                            <span
                                                class="text-[0.6rem] uppercase tracking-[0.26em] text-white/70 -mt-0.5">Aciertos</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </template>
                        <p v-else class="text-[0.8rem] text-white/30">Sin actividad registrada</p>
                    </div>
                </transition>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/style.css'

const props = defineProps({
    sessionsByDate: {
        type: Object,
        required: true,
    },
    rangeStart: {
        type: Date,
        required: true,
    },
    rangeEnd: {
        type: Date,
        required: true,
    },
    rangeDays: {
        type: Array,
        required: true,
    },
    hasActivity: {
        type: Boolean,
        default: true,
    },
})

const emit = defineEmits(['day-selected'])

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

function ringColorClass(percent) {
    if (percent == null) return 'text-zinc-600'
    if (percent >= 85) return 'text-emerald-400'
    if (percent >= 65) return 'text-cyan-400'
    if (percent >= 45) return 'text-amber-400'
    return 'text-rose-400'
}

function dotHexColor(percent, total) {
    if (total === 0) return '#52525b'
    if (percent >= 85) return '#34d399'
    if (percent >= 65) return '#22d3ee'
    if (percent >= 45) return '#fbbf24'
    return '#f87171'
}

const toDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const getAccuracy = (correct, total) =>
    total > 0 ? Math.round((correct / total) * 100) : null

const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })

const calendarAttributes = computed(() =>
    props.rangeDays.map(date => {
        const key = toDateKey(date)
        const data = props.sessionsByDate[key] ?? { correct: 0, total: 0, sessions: 0 }
        const percent = getAccuracy(data.correct, data.total)
        const color = dotHexColor(percent ?? 0, data.total)

        return {
            key,
            dates: date,
            ...(data.total > 0 && {
                highlight: {
                    style: {
                        backgroundColor: color + '4D',
                        border: `1.5px solid ${color}99`,
                        borderRadius: '8px',
                        width: '38px',
                        height: '38px',
                    },
                },
            }),
        }
    })
)

const selectedDay = ref(null)

function getDayData(date) {
    const key = toDateKey(date)
    const data = props.sessionsByDate[key] ?? { correct: 0, total: 0, sessions: 0 }

    return {
        ...data,
        percent: getAccuracy(data.correct, data.total),
        dateKey: key,
        dateLabel: fmt.format(date),
    }
}

function selectDay(date) {
    selectedDay.value = getDayData(date)
    emit('day-selected', selectedDay.value)
    setTimeout(() => {
        const el = document.getElementById('day-detail')
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
        }
    }, 100)
}

function onDayClick({ date }) {
    selectDay(date)
}

function initCurrentDay() {
    const today = new Date()
    const todayKey = toDateKey(today)
    const inRange = props.rangeDays.some(date => toDateKey(date) === todayKey)
    if (inRange) {
        selectDay(today)
    }
}

onMounted(initCurrentDay)
watch(() => props.rangeDays, initCurrentDay, { immediate: true })
</script>

<style scoped>
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

:deep(.vc-week:has(.vc-day.is-not-in-month):not(:has(.vc-day:not(.is-not-in-month)))) {
    display: none !important;
}

:deep(.vc-weekday) {
    color: rgba(255, 255, 255, 0.3) !important;
    font-size: 0.68rem !important;
}

:deep(.vc-day-content) {
    color: rgba(255, 255, 255, 0.65) !important;
    font-size: 0.95rem !important;
    width: 50px !important;
    height: 50px !important;
    border-radius: 8px !important;
    transition: background 0.15s !important;
}

@media (max-width: 767px) {
    :deep(.vc-day-content) {
        width: 100% !important;
        height: 100% !important;
    }

    :deep(.vc-day) {
        aspect-ratio: 1 !important;
    }
}

:deep(.vc-day-content:hover) {
    background: rgba(255, 255, 255, 0.08) !important;
    cursor: pointer !important;
}

:deep(.vc-day-content.is-disabled) {
    color: rgba(255, 255, 255, 0.15) !important;
}

:deep(.vc-week) {
    margin-bottom: 1px !important;
}
</style>
