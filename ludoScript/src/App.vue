<template>
  <Toast/>
  <RouterView />
  <ConfirmDialog />
</template>

<script setup>
import { RouterView } from 'vue-router'
import Toast from 'primevue/toast';
import ConfirmDialog from 'primevue/confirmdialog'

import { onMounted } from 'vue'
import { useAuthStore } from '@/stores/auth.store'

const auth = useAuthStore()

onMounted(async () => {
  if (auth.isLoggedIn) {
    await auth.fetchMe()
  } else {
    auth.ready = true  // si no hay token, marcar como listo igualmente
  }
})
</script>

<style scoped>
</style>
