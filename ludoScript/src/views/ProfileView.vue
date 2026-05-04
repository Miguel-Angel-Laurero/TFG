<template>
  <div class="flex flex-col min-h-screen md:h-screen bg-slate-900/20 md:overflow-hidden">
    <Header class="shrink-0" />
    
    <main class="flex-1 w-full overflow-visible md:overflow-y-auto md:min-h-0">
      <Profile />
    </main>
    
    <Footer class="shrink-0" />
  </div>
</template>
<script setup>
import Footer from '@/components/shared/Footer.vue';
import Header from '@/components/shared/Header.vue';
import Profile from '@/components/profile/Profile.vue';
</script>
