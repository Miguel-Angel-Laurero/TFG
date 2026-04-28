<template>
  <div class="flex flex-col h-screen bg-slate-900/20 overflow-hidden">
    <Header class="shrink-0" />
    
    <main class="flex-1 overflow-y-auto max-h-[90vh] w-full ">
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
