<template>
  <div class="h-screen flex flex-col ">
    <header>
      <Header/>
    </header>
    <main class="flex-1 min-h-0 overflow-auto">
      <Profile />
    </main>
    <footer>
      <Footer/>
    </footer>
  </div>
</template>
<script setup>
  import Footer from '@/components/shared/Footer.vue';
  import Header from '@/components/shared/Header.vue';
  import Profile from '@/components/profile/Profile.vue';
</script>
