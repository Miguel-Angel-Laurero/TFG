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
  if (auth.hasToken) {
    await auth.fetchMe()
    // Hidrata el localStorage con los PDFs de la nube al recargar la página
    try {
      const { pdfService } = await import('@/api/pdf.service')
      const { syncPdfsFromServer } = await import('@/composables/useAdaptiveSelection')
      const { data: pdfs } = await pdfService.syncAll()
      syncPdfsFromServer(pdfs)
    } catch {
      // Error no crítico: el usuario puede seguir usando la app sin sincronización
    }
  } else {
    auth.ready = true  // si no hay token, marcar como listo igualmente
  }
})
</script>

<style scoped>
</style>
