<template>
  <div class="min-h-screen flex flex-col bg-brand-dark">
    <header>
      <Header />
    </header>
    <main class="flex-grow flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-indigo-900 shadow-xl rounded-2xl border border-brand-primary/30 overflow-hidden">
        <Register />
      </div>
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
  import Header from '@/components/shared/Header.vue'
  import Footer from '@/components/shared/Footer.vue'
  import Register from '@/components/auth/Register.vue'
</script>