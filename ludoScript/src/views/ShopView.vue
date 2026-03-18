<template>
  <div class="h-screen flex flex-col">
    <header>
      <Header/>
    </header>
    <main class="h-screen flex-grow">
      <Shop/>
    </main>
    <footer>
      <Footer/>
    </footer>
  </div>
</template>
<script setup>
  import Footer from '@/components/shared/Footer.vue';
  import Header from '@/components/shared/Header.vue';
  import Shop from '@/components/shop/Shop.vue';
</script>