<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <Header/>
    </header>
    <main class="flex-grow">
      <Profile />
    </main>
    <footer>
      <Footer/>
    </footer>
  </div>
</template>
<script setup>
import Footer from '@/components/Footer.vue';
import Header from '@/components/Header.vue';
import Profile from '@/components/Profile.vue';
</script>
