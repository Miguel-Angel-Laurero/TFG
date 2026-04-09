<template>
  <div class="h-screen flex flex-col">
    <header>
      <Header />
    </header>
    <main class="flex-1 min-h-0 overflow-auto">
      <Groups />
    </main>
    <footer>
      <Footer />
    </footer>
  </div>
</template>

<script setup>
import Header from '@/components/shared/Header.vue'
import Footer from '@/components/shared/Footer.vue'
import Groups from '@/components/groups/Groups.vue'
</script>
