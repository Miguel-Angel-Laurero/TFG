<template>
  <div class="min-h-screen flex flex-col">
    <header>
      <Header/>
    </header>
    <main class="flex-grow">
      <div>
          <form class="border-b border-gray-100 bg-gray-50 text-gray-900">
            <label for="name">Nombre:</label>
            <input type='text' id="username">
            <label for="pass">Contraseña: </label>
            <input type='password' id="pass">
            <input type='submit'  value="Iniciar sesión">
          </form>
      </div>
    </main>
    <footer>
      <Footer/>
    </footer>
  </div>
</template>
<script setup>
import Header from '@/components/Header.vue';
import Footer from '@/components/Footer.vue';
</script>