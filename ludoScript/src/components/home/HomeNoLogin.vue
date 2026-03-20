<template>
  <main class="home-container flex flex-col items-center justify-center h-full">
    <div class="items-center justify-center">
      <p class="text-2xl text-white p-4">LudoScript</p>
      <div class="">
        <RouterLink
          to="/register-view"
          class="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 transition-colors"
        >
          Crear Cuenta
        </RouterLink>
        <RouterLink
          to="/login-view/"
          class="bg-gray-50 text-black px-6 py-3 rounded-xl font-bold hover:bg-gray-200 transition-colors"
        >
          Iniciar Sesión
        </RouterLink>
      </div>
    </div>
  </main>
</template>
<script setup>
</script>
<style scoped>
.bg-light {
  background-color: #f8f9fa;
}
</style>