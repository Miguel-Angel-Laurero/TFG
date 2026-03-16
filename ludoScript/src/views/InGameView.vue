<template>
      <div class="min-h-screen flex flex-col">
    <header>
      <Header/>
    </header>
    <main class="flex-grow">
        <InGame :initialGame="selectedGame" />
    </main>
    <footer>
        <Footer/>
    </footer>
  </div>
</template>
<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import InGame from '@/components/minigames/InGame.vue'
import Header from '@/components/shared/Header.vue'
import Footer from '@/components/shared/Footer.vue'

const route = useRoute()
const selectedGame = computed(() => route.query.game || null)
</script>
