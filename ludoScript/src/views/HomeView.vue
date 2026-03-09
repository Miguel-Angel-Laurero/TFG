<template>
  <header>
    <Cabeza/>
  </header>
  <main>
    <Home />
  </main>
  <footer>
    <Pata/>
  </footer>
</template>
<script setup>
  import Home from '@/components/Home.vue';
  import Cabeza from '@/components/Header.vue';
  import Pata from '@/components/Footer.vue';
</script>
