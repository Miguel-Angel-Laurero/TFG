<template>
    <div class="w-full flex flex-col md:flex-row md:h-full md:overflow-hidden">
        <section class="order-2 md:order-none flex-1 md:overflow-y-auto py-6 px-4 sm:px-8">
            <div class="max-w-6xl mx-auto">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Banner />
                    <UserInfo :summary-metrics="summaryMetrics" />
                </div>

                <div class="backdrop-blur-xl p-2 mt-6">
                    <div
                        class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/5 pb-4 mb-4">
                        <div>
                            <h2 class="text-2xl font-bold text-white tracking-tight">Actividad Reciente</h2>
                            <p class="text-xs text-indigo-300/60 mt-1 max-w-xl">
                                Revisa qué días has practicado y cómo ha ido tu rendimiento reciente.
                            </p>
                        </div>

                        <div v-if="performanceStatus" :class="[performanceStatus.bg, performanceStatus.border]"
                            class="border px-4 py-2 rounded-2xl transition-all duration-500 flex flex-col items-start sm:items-end shrink-0">
                            <span :class="performanceStatus.color" class="text-xs font-bold uppercase tracking-tighter">
                                {{ performanceStatus.text }}
                            </span>
                            <span class="text-[10px] text-white/40 font-medium">
                                {{ performanceStatus.subtext }}
                            </span>
                        </div>
                    </div>

                    <PerformanceCalendar :sessions-by-date="sessionsByDate" :range-start="rangeStart"
                        :range-end="rangeEnd" :range-days="rangeDays" :has-activity="hasActivity"
                        @day-selected="onDaySelected" />

                    <RouterLink to="/learning-area/"
                        class="mt-4 inline-flex w-full sm:w-auto items-center justify-center rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-black text-slate-950 transition-colors hover:bg-yellow-300">
                        Ir al área de aprendizaje
                    </RouterLink>
                </div>
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
