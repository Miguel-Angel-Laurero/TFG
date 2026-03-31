<template>
  <div class="home-page" :class="{ dark: isDark }">
    <div class="home-inner">

      <!-- Columna izquierda: minijuegos -->
      <div class="home-left">
        <GameGrid />
      </div>

      <!-- Columna derecha: gráfica de actividad -->
      <div class="home-right">
        <HomeChart />
      </div>

    </div>
  </div>
</template>

<script setup>
  import GameGrid  from '@/components/home/GameGrid.vue'
  import HomeChart from '@/components/home/HomeChart.vue'
  import { useTheme } from '@/composables/useTheme'

  const { isDark } = useTheme()
</script>

<style scoped>
.home-page {
  background: #f5f6fa;
  min-height: 100%;
  padding: 2rem 2.5rem;
  transition: background 0.3s;
}

.home-page.dark {
  background: #0f1117;
}

.home-inner {
  display: flex;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  align-items: flex-start;
}

.home-left {
  flex: 1;
  min-width: 0;
}

.home-right {
  width: 400px;
  flex-shrink: 0;
}

@media (max-width: 1024px) {
  .home-inner { flex-direction: column; }
  .home-right  { width: 100%; }
}
</style>