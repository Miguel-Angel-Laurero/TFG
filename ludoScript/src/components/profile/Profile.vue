<template>
  <div class="w-full mx-auto p-4 md:p-8 flex flex-col gap-8 bg-blue-950">
    
    <header class="relative w-full">
      <Banner />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      
      <aside class="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-8">
        <div class="bg-slate-950/30 backdrop-blur-xl p-2 ">
           <UserStats />
        </div>
      </aside>

      <main class="lg:col-span-8 flex flex-col gap-6">
        <div class="bg-slate-950/30 backdrop-blur-xl p-2 ">
          <FortnightResume />
        </div>
      </main>

    </div>
  </div>
</template>

<script setup>
import Banner from './Banner.vue';
import FortnightResume from './FortnightResume.vue';
import UserStats from './UserStats.vue';
</script>