<template>
    <div class="w-full flex flex-col md:flex-row md:h-full md:overflow-hidden">     
        <section class="order-2 md:order-none flex-1 md:overflow-y-auto px-4 py-6 sm:px-8 md:px-12 lg:px-32">
            <div class="grid grid-cols-2 gap-3">
                <Banner />
                <div class="grid grid-cols-2 md:grid-cols-1 gap-4">

                    <UserInfo />
                    <!-- Dashboard.vue — solo el article -->
                    <article
                        v-for="metric in summaryMetrics"
                        :key="metric.label"
                        class="group bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 rounded-2xl p-3 transition-all duration-300"
                    >
                        <p class="text-[9px] uppercase font-black text-indigo-300/50 tracking-widest mb-2">
                            {{ metric.label }}
                        </p>
                        <div class="flex items-center gap-2">
                            <div class="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors shrink-0">
                                <i :class="`pi ${metric.icon} text-indigo-400 text-base`" />
                            </div>
                            <div>
                                <p class="text-xl font-black text-white group-hover:text-indigo-300 transition-colors leading-none">
                                    {{ metric.value }}
                                </p>
                                <p class="text-[10px] text-white/55 mt-0.5 font-medium">{{ metric.helper }}</p>
                            </div>
                        </div>
                    </article>
                </div>
            </div>

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
    </div>
</template>

<script setup>
import { ref } from 'vue'
import UserInfo from '../shared/UserInfo.vue'
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
