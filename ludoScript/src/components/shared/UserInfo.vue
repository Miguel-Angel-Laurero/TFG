<template>
  <div class="progress-card">

    <!-- Header -->
    <div class="progress-header">
      <div>
        <h2 class="card-title font-righteous">Tu Progreso</h2>
        <p class="card-sub">{{ monthName }} {{ year }}</p>
      </div>
      <div class="streak-badge">
        🔥 <span>{{ auth.userData?.streak ?? 0 }}</span> días de racha
      </div>
    </div>

    <!-- Calendario mensual -->
    <div class="calendar-section">
      <div class="cal-weekdays">
        <span v-for="d in weekdays" :key="d">{{ d }}</span>
      </div>
      <div class="cal-days">
        <span
          v-for="(cell, i) in calendarCells"
          :key="i"
          :class="[
            'cal-cell',
            {
              'cal-empty':  cell === null,
              'cal-active': cell !== null && isDayActive(cell),
              'cal-today':  cell !== null && isToday(cell),
              'cal-normal': cell !== null && !isDayActive(cell) && !isToday(cell),
            }
          ]"
        >{{ cell ?? '' }}</span>
      </div>
    </div>

    <!-- Stats -->
    <div class="stats-grid">
      <div class="stat-item">
        <span class="stat-value stat-yellow">{{ auth.userData?.tests ?? 0 }}</span>
        <span class="stat-label">Tests</span>
      </div>
      <div class="stat-item">
        <span class="stat-value stat-blue">{{ auth.userData?.coins ?? 0 }}</span>
        <span class="stat-label">GB RAM</span>
      </div>
      <div class="stat-item">
        <span class="stat-value stat-green">{{ auth.userData?.accuracy ?? 0 }}%</span>
        <span class="stat-label">Precisión</span>
      </div>
      <div class="stat-item">
        <span class="stat-value stat-purple">{{ auth.userData?.timeSpent ?? 0 }}h</span>
        <span class="stat-label">Práctica</span>
      </div>
    </div>

    <!-- Barra de lecciones -->
    <div class="lessons-row">
      <div class="lessons-header">
        <span class="lessons-label">Lecciones completadas</span>
        <span class="lessons-count">12 / 20</span>
      </div>
      <div class="lessons-bar-bg">
        <div class="lessons-bar" style="width: 60%"></div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

const today    = new Date()
const year     = today.getFullYear()
const month    = today.getMonth()
const todayDate = today.getDate()
const daysInMonth = new Date(year, month + 1, 0).getDate()

const monthNames = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
]
const monthName = monthNames[month]
const weekdays  = ['L','M','X','J','V','S','D']

// Primer día de la semana en lunes (Mon=0 … Sun=6)
const startDow = (new Date(year, month, 1).getDay() + 6) % 7

const calendarCells = computed(() => {
  const cells = []
  for (let i = 0; i < startDow; i++) cells.push(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  return cells
})

const streak      = computed(() => parseInt(auth.userData?.streak ?? 0))
const activeStart = computed(() => todayDate - streak.value + 1)

const isDayActive = (day) => day >= activeStart.value && day <= todayDate
const isToday     = (day) => day === todayDate
</script>

<style scoped>
.progress-card {
  background: #ffffff;
  border-radius: 1.25rem;
  padding: 1.75rem 2rem;
  box-shadow: 0 1px 3px rgba(0,0,0,0.06), 0 4px 16px rgba(0,0,0,0.06);
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* ── Header ── */
.progress-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 0.75rem;
}
.card-title {
  font-size: 1.4rem;
  font-weight: 900;
  color: #1a1a2e;
  margin: 0;
  letter-spacing: -0.02em;
}
.card-sub {
  font-size: 0.8rem;
  color: #9ca3af;
  margin: 0.2rem 0 0;
  text-transform: capitalize;
}
.streak-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  background: #fff7ed;
  border: 1.5px solid #fed7aa;
  color: #c2410c;
  font-weight: 700;
  font-size: 0.82rem;
  padding: 0.35rem 0.9rem;
  border-radius: 999px;
}

/* ── Calendario ── */
.calendar-section {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.cal-weekdays {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 2px;
}
.cal-weekdays span {
  text-align: center;
  font-size: 0.68rem;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  padding: 0.15rem 0;
}
.cal-days {
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 3px;
}
.cal-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 2.2rem;
  border-radius: 0.45rem;
  font-size: 0.78rem;
  font-weight: 600;
  transition: all 0.15s;
}
.cal-empty  { visibility: hidden; }
.cal-normal { background: #f3f4f6; color: #6b7280; }
.cal-active { background: #facc15; color: #713f12; font-weight: 700; }
.cal-today  {
  background: #1484a1;
  color: #ffffff;
  font-weight: 800;
  box-shadow: 0 0 0 2px rgba(20,132,161,0.25);
}

/* ── Stats ── */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 0.75rem;
}
.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #f9fafb;
  border: 1px solid #f3f4f6;
  border-radius: 0.875rem;
  padding: 0.875rem 0.5rem;
  gap: 0.3rem;
}
.stat-value  { font-size: 1.5rem; font-weight: 900; line-height: 1; }
.stat-yellow { color: #d97706; }
.stat-blue   { color: #1484a1; }
.stat-green  { color: #16a34a; }
.stat-purple { color: #7c3aed; }
.stat-label  {
  font-size: 0.7rem;
  color: #9ca3af;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

/* ── Barra de lecciones ── */
.lessons-row { display: flex; flex-direction: column; gap: 0.5rem; }
.lessons-header { display: flex; justify-content: space-between; align-items: center; }
.lessons-label { font-size: 0.82rem; font-weight: 600; color: #4b5563; }
.lessons-count { font-size: 0.82rem; font-weight: 700; color: #1484a1; }
.lessons-bar-bg {
  height: 8px;
  background: #f3f4f6;
  border-radius: 999px;
  overflow: hidden;
}
.lessons-bar {
  height: 100%;
  background: linear-gradient(90deg, #facc15 0%, #1484a1 100%);
  border-radius: 999px;
  transition: width 0.6s ease;
}
</style>