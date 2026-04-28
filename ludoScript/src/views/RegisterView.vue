<template>
  <div class="min-h-screen flex flex-col bg-brand-dark">
    <header>
      <Header />
    </header>
    <main class="flex-grow flex items-center justify-center">
      <div class="w-full max-w-5xl shadow-xl overflow-hidden">
        <Register />
      </div>
    </main>
    <footer>
      <FooterNoLogin />
    </footer>
  </div>
</template>

<script setup>
  import Header from '@/components/shared/Header.vue'
  import Register from '@/components/auth/Register.vue'
  import FooterNoLogin from '@/components/shared/FooterNoLogin.vue';
</script>