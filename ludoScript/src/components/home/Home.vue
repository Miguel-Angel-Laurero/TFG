<template>
  <main class="home-container">
    <HomeHero 
    title="Bienvenido a la Tienda" 
    cta-link="/shop" 
    />
    <section>
      <h2 class="text-center text-gray-50">Minijuegos</h2>
      <GameGrid />
    </section>

    <!-- <section >
      <h2 class="text-center text-gray-50">Estadísticas</h2>
      <UserStats />
    </section> -->
  </main>
</template>
<script setup>
  import GameGrid from '@/components/home/GameGrid.vue';
  import UserStats from '@/components/profile/UserStats.vue';
</script>
<style scoped>
.bg-light {
  background-color: #f8f9fa;
}
</style>