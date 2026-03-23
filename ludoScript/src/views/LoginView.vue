<template>
  <div class="min-h-screen flex flex-col bg-brand-dark">
    <header>
      <Header />
    </header>
    <main class="flex-grow flex items-center justify-center p-4">
      <div class="w-full max-w-md bg-indigo-900 shadow-xl rounded-2xl  border-brand-primary/30 overflow-hidden">
        <Login />
      </div>
    </main>
    <footer>
      <FooterNoLogin />
    </footer>
  </div>
</template>

<script setup>
  import Header from '@/components/shared/Header.vue'
  import FooterNoLogin from '@/components/shared/FooterNoLogin.vue'
  import Login from '@/components/auth/Login.vue'
</script>

<style scoped>
/* Ajuste para que el componente Password de PrimeVue ocupe todo el ancho */
:deep(.p-password input) {
  width: 100%;
}
</style>