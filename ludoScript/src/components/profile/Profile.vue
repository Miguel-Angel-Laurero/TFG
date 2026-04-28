<template>
    <div class="w-full h-full mx-auto grid grid-cols-1 lg:grid-cols-10 gap-4 items-stretch">

        <!-- Columna izquierda: progreso del usuario -->
        <aside class="lg:col-span-2 lg:sticky lg:top-8 self-stretch">
            <div class="h-full backdrop-blur-xl bg-blue-900/20 border border-blue-900/40">
                <UserStats />
            </div>
        </aside>

        <!-- Columna central: calendario -->
        <section class="lg:col-span-6  my-4 mx-16">
          <Banner/>
            <div class="backdrop-blur-xl p-4">
                <!-- Header de rendimiento -->
                <div class="flex flex-col sm:flex-row sm:items-end justify-between gap-3 border-b border-white/5 pb-4 mb-4">
                    <div>
                        <h2 class="text-2xl font-bold text-white tracking-tight">Actividad Reciente</h2>
                    </div>
                    <div
                        v-if="performanceStatus"
                        :class="[performanceStatus.bg, performanceStatus.border]"
                        class="border px-4 py-2 rounded-2xl transition-all duration-500 flex flex-col items-end shrink-0"
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
                    @day-selected="onDaySelected"
                />
                    <div class="flex-shrink-0 flex flex-col ">
        </div>
            </div>
        </section>

        <!-- Columna derecha: métricas -->
        <aside class="lg:col-span-2 lg:sticky lg:top-8 self-stretch">
            <div class="h-full backdrop-blur-xl bg-blue-900/20 border border-blue-900/40 p-4">
                <h3 class="text-2xl text-white font-bold">Rendimiento</h3>
                <p class="text-xs text-indigo-300/50 mt-1 p-4">
                      Métricas de precisión de los últimos 14 tests
                </p> 
                <div class="grid grid-cols-1 gap-3">
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
} = useFortnightData()

const selectedDay = ref(null)

function onDaySelected(day) {
    selectedDay.value = day
}
</script>