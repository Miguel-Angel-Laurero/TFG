<template>
    <div class="border border-white/5 rounded-[2rem] overflow-y-auto max-h-[500px] custom-scroll">
        
        <VCalendar
            :attributes="calendarAttributes"
            :min-date="rangeStart"
            :max-date="rangeEnd"
            :first-day-of-week="2"
            :masks="{ weekdays: 'WWW' }"
            expanded
            borderless
            @dayclick="onDayClick"
        />

        <transition
            enter-active-class="transition-all duration-200 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            leave-active-class="transition-all duration-150 ease-in"
            leave-to-class="opacity-0 -translate-y-1"
        >
            <div
                v-if="selectedDay"
                id="day-detail"
                class="mx-4 mb-4 bg-white/[0.05] border border-white/10 rounded-[14px] p-4 scroll-mt-4"
            >
                <div class="flex justify-between items-center mb-3">
                    <span class="text-sm font-semibold text-white">{{ selectedDay.dateLabel }}</span>
                    <button
                        class="text-white/35 hover:text-white/70 text-xs px-1.5 py-0.5 rounded-md transition-colors cursor-pointer"
                        @click="selectedDay = null"
                    >✕</button>
                </div>

                <template v-if="selectedDay.total > 0">
                    <div class="flex flex-col gap-2.5">
                        <div class="flex items-baseline gap-2">
                            <span
                                class="text-[2rem] font-extrabold leading-none"
                                :class="accuracyColorClass(selectedDay.percent)"
                            >
                                {{ selectedDay.percent }}%
                            </span>
                            <span class="text-[0.72rem] text-white/40">precisión</span>
                        </div>
                        <div class="flex justify-between text-[0.78rem] text-white/50">
                            <span>Respuestas</span>
                            <span class="text-white/80 font-medium">
                                {{ selectedDay.correct }}/{{ selectedDay.total }}
                            </span>
                        </div>
                        <div class="flex justify-between text-[0.78rem] text-white/50">
                            <span>Sesiones</span>
                            <span class="text-white/80 font-medium">{{ selectedDay.sessions }}</span>
                        </div>
                        <div class="h-1.5 bg-black/30 rounded-full overflow-hidden">
                            <div
                                class="h-full rounded-full transition-[width] duration-500 ease-out"
                                :class="accuracyBgClass(selectedDay.percent)"
                                :style="{ width: selectedDay.percent + '%' }"
                            />
                        </div>
                    </div>
                </template>
                <p v-else class="text-[0.8rem] text-white/30">Sin actividad registrada</p>
            </div>
        </transition>
    </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { Calendar as VCalendar } from 'v-calendar'
import 'v-calendar/style.css'

// ── Props ────────────────────────────────────────────────────────
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
})

// ── Emits ────────────────────────────────────────────────────────
const emit = defineEmits(['day-selected'])

// ── Utilidades de color ──────────────────────────────────────────
function accuracyColorClass(percent) {
    if (percent == null) return 'text-white/30'
    if (percent >= 85)   return 'text-emerald-400'
    if (percent >= 65)   return 'text-cyan-400'
    if (percent >= 45)   return 'text-amber-400'
    return 'text-rose-400'
}

function accuracyBgClass(percent) {
    if (percent == null) return 'bg-zinc-600'
    if (percent >= 85)   return 'bg-emerald-400'
    if (percent >= 65)   return 'bg-cyan-400'
    if (percent >= 45)   return 'bg-amber-400'
    return 'bg-rose-400'
}

function dotHexColor(percent, total) {
    if (total === 0)   return '#52525b' // zinc-600
    if (percent >= 85) return '#34d399' // emerald-400
    if (percent >= 65) return '#22d3ee' // cyan-400
    if (percent >= 45) return '#fbbf24' // amber-400
    return '#f87171'                    // rose-400
}


const toDateKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`

const getAccuracy = (correct, total) =>
    total > 0 ? Math.round((correct / total) * 100) : null

const fmt = new Intl.DateTimeFormat('es-ES', { day: '2-digit', month: 'short' })

// ── Atributos v-calendar ─────────────────────────────────────────
const calendarAttributes = computed(() =>
    props.rangeDays.map(date => {
        const key     = toDateKey(date)
        const data    = props.sessionsByDate[key] ?? { correct: 0, total: 0, sessions: 0 }
        const percent = getAccuracy(data.correct, data.total)
        const color   = dotHexColor(percent ?? 0, data.total)

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
    const key  = toDateKey(date)
    const data = props.sessionsByDate[key] ?? { correct: 0, total: 0, sessions: 0 }

    selectedDay.value = {
        ...data,
        percent:   getAccuracy(data.correct, data.total),
        dateKey:   key,
        dateLabel: fmt.format(date),
    }

    emit('day-selected', selectedDay.value)

    // AUTO-SCROLL: Hace que el detalle sea visible suavemente
    setTimeout(() => {
        const el = document.getElementById('day-detail');
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }, 100);
}
</script>

<style scoped>
CSS
/* --- Personalización del Scrollbar --- */
.custom-scroll {
    /* Forzamos el comportamiento de scroll vertical */
    overflow-y: auto !important;
    overflow-x: hidden;
    
    /* Firefox */
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}

/* Chrome, Edge, Safari y Brave */
.custom-scroll::-webkit-scrollbar {
    width: 6px !important; /* Forzar ancho */
    display: block !important;
}

.custom-scroll::-webkit-scrollbar-track {
    background: transparent !important;
}

.custom-scroll::-webkit-scrollbar-thumb {
    background-color: rgba(255, 255, 255, 0.15) !important;
    border-radius: 20px !important;
    border: 1px solid transparent; /* Padding sutil */
}

.custom-scroll::-webkit-scrollbar-thumb:hover {
    background-color: rgba(255, 255, 255, 0.3) !important;
}

/* IMPORTANTE: Si el scroll lo está haciendo un elemento interno de VCalendar */
.custom-scroll :deep(*) {
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.1) transparent;
}
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