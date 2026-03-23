<template>
  <div class="h-screen flex flex-col">
    <header class="flex sticky top-0 z-10 ">
      <Header/>
    </header>
    <main class="flex-grow">
      <Home v-if="auth.isLogged" />
      <HomeNoLogin v-else/>
    </main>
    <footer>
      <Footer v-if="auth.isLogged" />
      <FooterNoLogin v-else/>
    </footer>
  </div>
</template>
<script setup>
  import Home from '@/components/home/Home.vue';
  import Header from '@/components/shared/Header.vue';
  import Footer from '@/components/shared/Footer.vue';
  import HomeNoLogin from '@/components/landing/HomeNoLogin.vue';
  import FooterNoLogin from '@/components/shared/FooterNoLogin.vue';
  import { useAuthStore } from '@/stores/auth.store'
  const auth = useAuthStore()
</script>
