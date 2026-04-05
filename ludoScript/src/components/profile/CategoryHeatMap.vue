<template>
    <div class="bg-white/5 rounded-2xl p-5 border border-white/10">
        <h2 class="text-white font-semibold text-base mb-1">Mapa de progreso por área</h2>
        <p class="text-white/50 text-xs mb-4">
            Basado en tus respuestas del Quiz. Verde = dominas el área, rojo = necesitas repasar.
        </p>

        <!-- Estado de carga -->
        <div v-if="loading" class="flex items-center gap-2 text-white/40 text-sm py-4">
            <span
                class="animate-spin inline-block w-4 h-4 border-2 border-white/30 border-t-white/80 rounded-full"></span>
            Cargando estadísticas…
        </div>

        <!-- Sin datos todavía -->
        <div v-else-if="!hasData" class="text-center py-6 text-white/40 text-sm">
            Completa el Quiz por primera vez para ver tu mapa de progreso.
        </div>

        <!-- Cuadrícula del mapa de calor -->
        <div v-else class="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div v-for="item in heatData" :key="item.category"
                :class="['rounded-xl p-3 flex flex-col gap-1 transition-opacity', item.bgClass, item.total === 0 ? 'opacity-40' : 'opacity-100']">
                <span class="text-xs font-semibold text-white/90 leading-tight">{{ item.label }}</span>
                <span v-if="item.total > 0" class="text-2xl font-extrabold text-white">
                    {{ item.accuracyPct }}%
                </span>
                <span v-else class="text-lg font-bold text-white/50">—</span>
                <span class="text-white/60 text-xs">
                    <template v-if="item.total > 0">{{ item.correct }}/{{ item.total }} correctas</template>
                    <template v-else>Sin intentos</template>
                </span>
            </div>
        </div>

        <!-- Leyenda -->
        <div class="mt-4 flex flex-wrap gap-3 text-xs text-white/50">
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span>≥ 90 %
            </span>
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-yellow-400 inline-block"></span>70–89 %
            </span>
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-orange-500 inline-block"></span>50–69 %
            </span>
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-red-600 inline-block"></span>&lt; 50 %
            </span>
            <span class="flex items-center gap-1.5">
                <span class="w-3 h-3 rounded-full bg-zinc-600 inline-block"></span>Sin datos
            </span>
        </div>
    </div>
</template>

<script setup>
// components/profile/CategoryHeatMap.vue
// ─────────────────────────────────────────────────────────────────────────────
// Responsabilidad única: obtener las estadísticas por categoría del backend
// y visualizarlas como mapa de calor (verde → rojo según porcentaje de acierto).
// ─────────────────────────────────────────────────────────────────────────────
import { ref, computed, onMounted } from 'vue'
import { categoryStatsService } from '@/api/categoryStats.service'

// Catálogo completo de categorías del Quiz estático.
// Se muestran todas siempre, incluso si el usuario aún no las ha intentado.
const CATEGORIES = [
    { key: 'tipos-coercion', label: 'Tipos y Coerción' },
    { key: 'arrays-metodos', label: 'Arrays y Métodos' },
    { key: 'scope-variables', label: 'Scope y Variables' },
    { key: 'asincronia', label: 'Asincronía' },
    { key: 'funciones', label: 'Funciones' },
    { key: 'sintaxis-es6', label: 'Sintaxis ES6+' },
    { key: 'objetos', label: 'Objetos' },
]

// Devuelve la clase de fondo según el porcentaje de acierto
function bgClass(pct, total) {
    if (total === 0) return 'bg-zinc-700'
    if (pct >= 90) return 'bg-emerald-600'
    if (pct >= 70) return 'bg-yellow-500'
    if (pct >= 50) return 'bg-orange-500'
    return 'bg-red-700'
}

const loading = ref(true)
const rawStats = ref([]) // [{ category, correct, total }]

onMounted(async () => {
    try {
        const { data } = await categoryStatsService.getAll()
        rawStats.value = data
    } catch (err) {
        console.error('[CategoryHeatMap] No se pudieron cargar las stats:', err)
    } finally {
        loading.value = false
    }
})

// Índice por clave para merge rápido
const statsMap = computed(() => {
    const map = {}
    for (const s of rawStats.value) {
        map[s.category] = s
    }
    return map
})

const heatData = computed(() =>
    CATEGORIES.map(({ key, label }) => {
        const s = statsMap.value[key] ?? { correct: 0, total: 0 }
        const accuracyPct = s.total > 0 ? Math.round((s.correct / s.total) * 100) : 0
        return {
            category: key,
            label,
            correct: s.correct,
            total: s.total,
            accuracyPct,
            bgClass: bgClass(accuracyPct, s.total),
        }
    })
)

const hasData = computed(() => rawStats.value.length > 0)
</script>
