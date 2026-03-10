<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <Cabeza/>
    </header>
    <main class="flex-grow">
      <Home />
    </main>
    <footer>
      <Pata/>
    </footer>
  </div>
</template>
<script setup>
  import Home from '@/components/Home.vue';
  import Cabeza from '@/components/Header.vue';
  import Pata from '@/components/Footer.vue';
</script>
