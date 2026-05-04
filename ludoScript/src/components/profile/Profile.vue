<template>
    <div class="w-full flex flex-col md:flex-row md:h-full md:overflow-hidden">
        <aside class="order-1 md:order-none shrink-0 w-full md:w-64 md:h-full md:overflow-y-auto border-b md:border-b-0 md:border-r border-blue-900/40 bg-blue-900/20">
            <UserStats />
        </aside>

        <section class="order-2 md:order-none flex-1 md:overflow-y-auto px-4 py-6 sm:px-8 md:px-12 lg:px-32">
            <Banner />

            <div class="backdrop-blur-xl p-2">
                <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/5 pb-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-white tracking-tight">Actividad Reciente</h2>
                        <p class="text-xs text-indigo-300/60 mt-1 max-w-xl">
                            Revisa qué días has practicado y cómo ha ido tu rendimiento reciente.
                        </p>
                    </div>

                    <div
                        v-if="performanceStatus"
                        :class="[performanceStatus.bg, performanceStatus.border]"
                        class="border px-4 py-2 rounded-2xl transition-all duration-500 flex flex-col items-start sm:items-end shrink-0"
                    >
                        <span :class="performanceStatus.color" class="text-xs font-bold uppercase tracking-tighter">
                            {{ performanceStatus.text }}
                        </span>
                        <span class="text-[10px] text-white/40 font-medium">
                            {{ performanceStatus.subtext }}
                        </span>
                    </div>
                </div>

                <PerformanceCalendar
                    :sessions-by-date="sessionsByDate"
                    :range-start="rangeStart"
                    :range-end="rangeEnd"
                    :range-days="rangeDays"
                    :has-activity="hasActivity"
                    @day-selected="onDaySelected"
                />

                <RouterLink
                    to="/learning-area/"
                    class="mt-4 inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-yellow-300"
                >
                    Ir al área de aprendizaje
                </RouterLink>
            </div>
        </section>

        <aside class="order-3 md:order-none shrink-0 w-full md:w-72 md:h-full md:overflow-y-auto border-t md:border-t-0 md:border-l border-blue-900/40 bg-blue-900/20 px-6 py-6 md:py-8">
            <h3 class="text-2xl text-white font-bold">Rendimiento</h3>
            <p class="text-xs text-indigo-300/50 mt-1 mb-6">
                Resumen de precisión y sesiones de tus últimos tests.
            </p>

            <div class="grid grid-cols-2 md:grid-cols-1 gap-3">
                <article
                    v-for="metric in summaryMetrics"
                    :key="metric.label"
                    class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-3xl p-4 transition-all duration-300"
                >
                    <p class="text-[10px] uppercase font-black text-indigo-300/40 tracking-widest mb-2">
                        {{ metric.label }}
                    </p>
                    <p class="text-2xl font-black text-white group-hover:text-indigo-300 transition-colors">
                        {{ metric.value }}
                    </p>
                    <p class="text-[10px] text-white/20 mt-1.5 font-medium">{{ metric.helper }}</p>
                </article>
            </div>
        </aside>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import UserStats from './UserStats.vue'
import PerformanceCalendar from './PerformanceCalendar.vue'
import { useFortnightData } from '@/composables/useFortnightdata.js'
import Banner from './Banner.vue'

const {
    sessionsByDate,
    rangeStart,
    rangeEnd,
    rangeDays,
    summaryMetrics,
    performanceStatus,
    hasActivity,
} = useFortnightData()

const selectedDay = ref(null)

function onDaySelected(day) {
    selectedDay.value = day
}
</script>
