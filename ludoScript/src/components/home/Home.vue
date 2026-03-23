<template>
  <main class="h-full w-full home-container overflow-hidden">
    <section class="grid grid-rows-2 lg:grid-rows-10 gap-6 h-full">
        <div class="row-span-8 lg:row-span-6 flex flex-row h-full">
          <div class="w-2/5">
            <Loader/>
          </div>
          <div class="w-3/5">
            <GameGrid />
          </div>
        </div>
        <div class="row-span-8 lg:row-span-4 p-6 ">
          <UserInfo class="bg-gray-950/80 p-4 rounded-xl border-1 border-indigo-900"/>
        </div>
    </section>
  </main>
</template>
<script setup>
  import GameGrid from '@/components/home/GameGrid.vue';
  import UserInfo from '@/components/shared/UserInfo.vue';
  import Loader from '@/components/home/Loader.vue';
</script>