<template>
  <main class="h-full w-full flex overflow-hidden">

    <!-- Center: centered in the non-heatmap space -->
    <section class="flex-1 flex justify-center overflow-y-auto py-8">
      <div class="w-full max-w-2xl px-8">
        <h2 class="text-2xl font-righteous text-white mb-6">Minijuegos</h2>
        <GameGrid />
      </div>
    </section>

    <!-- Right panel: category heat maps -->
    <aside class="w-80 shrink-0 border-l border-blue-900/40 px-6 py-8 overflow-y-auto">
      <CategoryHeatMap />
    </aside>
  </main>
</template>
<script setup>
import GameGrid from '@/components/home/GameGrid.vue';
import CategoryHeatMap from '@/components/home/CategoryHeatMap.vue';
</script>