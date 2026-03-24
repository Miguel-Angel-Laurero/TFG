<template>
  <Toast/>
  <RouterView />
</template>

<script setup>
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast';

import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

onMounted(() => {
  if (auth.isLoggedIn) {
    auth.fetchMe()
  }
})
</script>

<style scoped>
</style>
