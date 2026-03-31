<template>
  <div class="chart-wrapper" :class="{ dark: isDark }">

    <!-- Título fuera de la tarjeta, alineado con "Minijuegos" -->
    <div class="chart-section-header">
      <div>
        <h2 class="section-title font-righteous">Actividad Semanal</h2>
        <p class="section-sub">Resumen de los últimos 7 días</p>
      </div>
      <div class="streak-badge">
        🔥 <span class="streak-num">{{ auth.userData?.streak ?? 0 }}</span>
        <span class="streak-txt">días de racha</span>
      </div>
    </div>

    <!-- Tarjeta: solo gráfica + resumen -->
    <div class="chart-card">

      <!-- Gráfica -->
      <div class="chart-body">
        <Chart v-if="chartData" type="bar" :data="chartData" :options="chartOptions" class="w-full h-full" />
      </div>

    <!-- Resumen numérico debajo -->
    <div class="chart-summary">
      <div class="summary-item">
        <span class="summary-dot dot-yellow"></span>
        <div>
          <p class="summary-val">{{ auth.userData?.tests ?? 0 }}</p>
          <p class="summary-label">Tests totales</p>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <span class="summary-dot dot-blue"></span>
        <div>
          <p class="summary-val">{{ auth.userData?.coins ?? 0 }}</p>
          <p class="summary-label">GB RAM</p>
        </div>
      </div>
      <div class="summary-divider"></div>
      <div class="summary-item">
        <span class="summary-dot dot-green"></span>
        <div>
          <p class="summary-val">{{ auth.userData?.accuracy ?? 0 }}%</p>
          <p class="summary-label">Precisión</p>
        </div>
      </div>
    </div>

    </div>

  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import Chart from 'primevue/chart'
import { useAuthStore } from '@/stores/auth.store'
import { useTheme } from '@/composables/useTheme'

const auth = useAuthStore()
const { isDark } = useTheme()

const chartData    = ref(null)
const chartOptions = ref(null)

function buildOptions(dark) {
  const textMuted  = dark ? '#6b7280' : '#9ca3af'
  const gridColor  = dark ? '#1f2937' : '#f3f4f6'
  const legendColor = dark ? '#d1d5db' : '#4b5563'
  return {
    maintainAspectRatio: false,
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: legendColor,
          font: { size: 12, weight: 600 },
          padding: 16,
          boxWidth: 12,
          boxHeight: 12,
          usePointStyle: true,
          pointStyle: 'circle'
        }
      }
    },
    scales: {
      x: {
        ticks:  { color: textMuted, font: { size: 11, weight: 600 } },
        grid:   { display: false },
        border: { display: false }
      },
      y: {
        beginAtZero: true,
        ticks:  { color: textMuted, font: { size: 11 } },
        grid:   { color: gridColor },
        border: { display: false }
      }
    }
  }
}

onMounted(() => {
  chartData.value = {
    labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
    datasets: [
      {
        label: 'Tests completados',
        backgroundColor: '#facc15',
        borderColor: '#facc15',
        borderRadius: 6,
        borderSkipped: false,
        data: [4, 7, 5, 9, 6, 3, 8]
      },
      {
        label: 'Puntos XP',
        backgroundColor: '#1484a1',
        borderColor: '#1484a1',
        borderRadius: 6,
        borderSkipped: false,
        data: [120, 210, 150, 270, 180, 90, 240]
      }
    ]
  }
  chartOptions.value = buildOptions(isDark.value)
})

watch(isDark, (val) => {
  chartOptions.value = buildOptions(val)
})
</script>

<style scoped>
/* Wrapper externo (sin tarjeta) */
.chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Título de sección fuera de la tarjeta */
.chart-section-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}
.section-title {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1a1a2e;
  letter-spacing: -0.02em;
  margin: 0;
  transition: color 0.3s;
}
.chart-wrapper.dark .section-title { color: #f1f5f9; }

.section-sub {
  font-size: 0.78rem;
  color: #9ca3af;
  margin: 0.2rem 0 0;
}

/* Tarjeta interior */
.chart-card {
  background: #ffffff;
  border-radius: 1.25rem;
  padding: 1.75rem 1.75rem 1.5rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  transition: background 0.3s, border-color 0.3s;
}
.chart-wrapper.dark .chart-card {
  background: #1a1d27;
  box-shadow: 0 1px 3px rgba(0,0,0,0.3), 0 4px 16px rgba(0,0,0,0.3);
}

/* Streak badge */
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #fff7ed;
  border: 1.5px solid #fed7aa;
  color: #c2410c;
  font-weight: 700;
  font-size: 0.8rem;
  padding: 0.4rem 0.9rem;
  border-radius: 999px;
  white-space: nowrap;
  transition: background 0.3s, border-color 0.3s;
}
.chart-wrapper.dark .streak-badge {
  background: rgba(251,146,60,0.1);
  border-color: rgba(251,146,60,0.3);
  color: #fb923c;
}
.streak-num { font-size: 1rem; }
.streak-txt { font-size: 0.72rem; font-weight: 600; opacity: 0.8; }

.chart-body { height: 260px; }

/* Summary */
.chart-summary {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #f3f4f6;
  transition: border-color 0.3s;
}
.chart-wrapper.dark .chart-summary { border-top-color: #2d3748; }

.summary-item {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex: 1;
}
.summary-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}
.dot-yellow { background: #facc15; }
.dot-blue   { background: #1484a1; }
.dot-green  { background: #22c55e; }

.summary-val {
  font-size: 1.1rem;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0;
  line-height: 1;
  transition: color 0.3s;
}
.chart-wrapper.dark .summary-val { color: #f1f5f9; }

.summary-label {
  font-size: 0.68rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin: 0.2rem 0 0;
}
.summary-divider {
  width: 1px;
  height: 2rem;
  background: #f3f4f6;
  flex-shrink: 0;
  transition: background 0.3s;
}
.chart-wrapper.dark .summary-divider { background: #2d3748; }
</style>
