<template>
  <main class="h-screen w-full home-container overflow-hidden" >
    <section class="grid grid-cols-2 lg:grid-cols-12 gap-8 h-full">
        <div class="col-span-12 lg:col-span-8">
          <GameGrid />
        </div>
        <div class="col-span-12 lg:col-span-4 p-6">
          <UserInfo />
        </div>
    </section>
  </main>
</template>
<script setup>
  import GameGrid from '@/components/home/GameGrid.vue';
  import UserInfo from '@/components/shared/UserInfo.vue';
</script>
<style scoped>
.bg-light {
  background-color: #f8f9fa;
}
</style>