<template>
  <div class="h-screen flex flex-col">
    <header>
      <Header/>
    </header>
    <main class="flex-grow">
      <Home v-if="!auth.isLogged" />
      <HomeNoLogin v-else/>
    </main>
    <footer>
      <Footer/>
    </footer>
  </div>
</template>
<script setup>
  import Home from '@/components/home/Home.vue';
  import Header from '@/components/shared/Header.vue';
  import Footer from '@/components/shared/Footer.vue';
  import HomeNoLogin from '@/components/home/HomeNoLogin.vue';

  import { useAuthStore } from '@/stores/auth.store'
  const auth = useAuthStore()
</script>
