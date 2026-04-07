<template>
    <div class="flex flex-col gap-6">

        <!-- Última sesión -->
        <section>
            <h3 class="text-[11px] font-semibold text-blue-400/70 uppercase tracking-widest mb-3">
                Última sesión
            </h3>

            <div v-if="summary" class="flex flex-col items-center gap-4">
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
                        <span class="text-[9px] text-slate-400 leading-none">precisión</span>
                    </div>
                </div>

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
            </div>

            <p v-else class="text-[11px] text-gray-500 italic">
                Completa una actividad para ver tus estadísticas.
            </p>
        </section>

    </div>
</template>

<script setup>
import { getSessionSummary } from '@/composables/useSessionTracker'

// r=24 → circunferencia = 2π×24
const CIRCUMFERENCE = 2 * Math.PI * 24

const summary = getSessionSummary()

const ringColor = !summary
    ? '#374151'
    : summary.accuracy > 70
        ? '#22c55e'
        : summary.accuracy > 40
            ? '#f97316'
            : '#ef4444'
</script>