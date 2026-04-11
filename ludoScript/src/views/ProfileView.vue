<template>
  <div class="h-screen flex flex-col">
    <header>
      <Header />
    </header>
    <main class="flex-1 min-h-0 overflow-y-auto">
      <div class="max-w-4xl mx-auto px-4 py-6 flex flex-col gap-6">
        <UserStats />
        <FortnightResume />
        <!-- <CategoryHeatMap /> -->
      </div>
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>
<script setup>
import Footer from '@/components/shared/Footer.vue';
import Header from '@/components/shared/Header.vue';
import UserStats from '@/components/profile/UserStats.vue';
import FortnightResume from '@/components/profile/FortnightResume.vue';
</script>
