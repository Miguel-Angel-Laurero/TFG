<template>
  <main class="h-full w-full home-container overflow-hidden" >
    <section class="grid grid-cols-2 lg:grid-cols-12 gap-8 h-full">
        <div class="col-span-12 lg:col-span-8 flex flex-col h-full ">
          <Loader/>
          <GameGrid />
        </div>
        <div class="col-span-12 lg:col-span-4 p-6">
          <RouterLink to="/shop-view/" class="col-span-full h-32 bg-emerald-400 rounded-xl p-4 font-bold text-3xl text-gray-50 flex justify-center items-center">
            <span>Tienda</span>
            <i class="pi pi-shopping-bag px-4" style="font-size: 1.5rem"></i>    
          </RouterLink>
          <UserInfo />
        </div>
    </section>
  </main>
</template>
<script setup>
  import GameGrid from '@/components/home/GameGrid.vue';
  import UserInfo from '@/components/shared/UserInfo.vue';
  import Loader from '@/components/home/Loader.vue';
</script>
