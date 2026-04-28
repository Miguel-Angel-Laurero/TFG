<template>
  <div class="w-full max-h-[80vh] max-w-[1400px] mx-auto p-4 md:p-8 flex flex-col items-center">
    
    <header class="relative w-full">
      <Banner />
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-12 bg-blue-900/60  items-start">
      
      <aside class="lg:col-span-4 flex flex-col gap-6 lg:sticky lg:top-8">
        <div class=" backdrop-blur-xl p-2 ">
           <UserStats />
        </div>
      </aside>

      <main class="lg:col-span-8 flex flex-col gap-6 lg:sticky lg:top-8">
        <div class=" backdrop-blur-xl p-2 ">
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