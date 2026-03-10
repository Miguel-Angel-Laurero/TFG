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
  import Home from '@/components/Home.vue';
  import Header from '@/components/Header.vue';
  import Footer from '@/components/Footer.vue';
</script>
