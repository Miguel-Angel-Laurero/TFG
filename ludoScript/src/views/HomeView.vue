<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <Header/>
    </header>
    <main class="flex-grow">
      <Home />
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
</script>
