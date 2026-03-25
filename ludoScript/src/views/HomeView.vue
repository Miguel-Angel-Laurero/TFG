<template>
  <div class="h-screen flex flex-col">
    <header class="flex sticky top-0 z-10 ">
      <Header/>
    </header>
    <main class="flex-grow">
        <!-- Overlay -->
<<<<<<< HEAD
      <div v-if="! auth.isLogged">
        <DailyReward/>
=======
      <div v-if="auth.isLoggedIn">
        <DailyReward v-if="!rewards.claimed"/>
>>>>>>> 1e67daf3e1ee8f9521d66c27c5bbc9ee8ccf66ba
        <Home  />
      </div>
      <HomeNoLogin v-else/>

    </main>
    <footer>
      <Footer v-if="auth.isLoggedIn" />
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
  import { useRewardsStore } from '@/stores/rewards.store';
  import DailyReward from '@/components/DailyReward.vue';
 
  const auth = useAuthStore()
  const rewards = useRewardsStore()
</script>
